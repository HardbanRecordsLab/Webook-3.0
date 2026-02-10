import React, { useCallback, useRef, useState } from 'react';
import { Upload, FolderPlus, Zap } from 'lucide-react';
import type { PlaceholderMapping, ProcessedAsset } from '../../types/assembly.types';
import { AssetProcessor } from '../../services/assembly/assetProcessor';
import { BatchMapper } from '../../services/assembly/batchMapper';
import PlaceholderTree from './PlaceholderTree';

interface AssetMappingPanelProps {
  placeholders: PlaceholderMapping[];
  mappings: Map<string, ProcessedAsset>;
  onSetMapping: (placeholder: string, asset: ProcessedAsset | undefined) => void;
}

const AssetMappingPanel: React.FC<AssetMappingPanelProps> = ({ placeholders, mappings, onSetMapping }) => {
  const [uploaded, setUploaded] = useState<ProcessedAsset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.isArray(files) ? files : Array.from(files);
    const processed: ProcessedAsset[] = [];
    for (const f of arr) {
      // basic type detection
      let type: PlaceholderMapping['type'] = 'other';
      if (f.type.includes('image')) type = 'raster';
      else if (f.type.includes('audio')) type = 'audio';
      else if (f.type === 'text/html') type = 'workcard-html';

      try {
        const pa = await AssetProcessor.process(f as File, type);
        processed.push(pa);
      } catch (err) {
        console.error('Asset processing failed', err);
      }
    }

    setUploaded(prev => [...processed, ...prev]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleAutoMap = useCallback(() => {
    const auto = BatchMapper.autoMapByName(uploaded, placeholders);
    for (const [k, v] of auto) onSetMapping(k, v);
  }, [uploaded, placeholders, onSetMapping]);

  const assignToSelected = useCallback((asset: ProcessedAsset) => {
    if (!selectedPlaceholder) return;
    onSetMapping(selectedPlaceholder, asset);
    setSelectedPlaceholder(null);
  }, [selectedPlaceholder, onSetMapping]);

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-4 border-dashed rounded-3xl p-8 text-center transition-all ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}
      >
        <Upload className="mx-auto mb-4 text-slate-600" size={42} />
        <p className="text-sm text-slate-500">Drop assets here or click to browse</p>
        <div className="mt-4 flex justify-center gap-3">
          <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded bg-slate-100">Browse</button>
          <button onClick={() => { /* simulate folder upload; user selects multiple files */ fileInputRef.current?.click(); }} className="px-4 py-2 rounded bg-slate-100"><FolderPlus /> Upload Folder</button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border">
        <div className="flex items-center justify-between mb-4">
          <div className="font-black">Uploaded Assets ({uploaded.length})</div>
          <div className="flex gap-2">
            <button onClick={handleAutoMap} className="px-3 py-2 rounded bg-amber-500 text-white text-xs flex items-center gap-2"><Zap size={14}/> Auto-Map by Name</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {uploaded.map(a => (
            <div key={a.id} className="p-3 rounded-lg bg-white border relative">
              {a.meta?.mime?.startsWith('image') && <img src={a.url} alt={a.originalName} className="w-full h-28 object-cover rounded" />}
              <div className="mt-2 text-xs font-bold truncate">{a.originalName}</div>
              <div className="text-[11px] text-slate-500">{Math.round(a.size/1024)} KB</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => assignToSelected(a)} className="px-2 py-1 rounded bg-slate-100 text-xs">Assign to selected</button>
                <button onClick={() => navigator.clipboard?.writeText(a.checksum)} className="px-2 py-1 rounded bg-white border text-xs">Copy checksum</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-black mb-3">Placeholders</h4>
            <PlaceholderTree placeholders={placeholders} mappings={mappings} onSelect={(n) => setSelectedPlaceholder(n)} />
          </div>

          <div>
            <h4 className="font-black mb-3">Mappings</h4>
            <div className="space-y-2">
              {Array.from(mappings.entries()).map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded border flex items-center justify-between">
                  <div>
                    <code className="font-bold">{k}</code>
                    <div className="text-xs text-slate-500">{v?.originalName ?? '—'}</div>
                  </div>
                  <div className="text-xs text-slate-400">{v?.meta?.mime ?? ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetMappingPanel;
