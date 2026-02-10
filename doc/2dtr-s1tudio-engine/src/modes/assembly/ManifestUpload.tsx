import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Download } from 'lucide-react';
import type { AssemblyManifest, PlaceholderMapping } from '../../types/assembly.types';
import { ManifestService } from '../../services/assembly/manifestService';

interface ManifestUploadProps {
  onManifestParsed: (manifest: AssemblyManifest, placeholders: PlaceholderMapping[]) => void;
}

const ManifestUpload: React.FC<ManifestUploadProps> = ({ onManifestParsed }) => {
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<AssemblyManifest | null>(null);
  const [placeholders, setPlaceholders] = useState<PlaceholderMapping[]>([]);
  const [structureErrors, setStructureErrors] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setError(null);
    setManifest(null);
    setPlaceholders([]);
    setStructureErrors([]);

    try {
      const parsed = await ManifestService.parseManifest(file);
      const ph = ManifestService.extractPlaceholders(parsed);
      const structure = ManifestService.validateStructure(parsed);
      setManifest(parsed);
      setPlaceholders(ph);
      setStructureErrors(structure);

      onManifestParsed(parsed, ph);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }, [onManifestParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleLoadExample = useCallback(async () => {
    try {
      const resp = await fetch('/src/schemas/manifest.example.json');
      const json = await resp.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const file = new File([blob], 'manifest.example.json', { type: 'application/json' });
      await parseFile(file);
    } catch (err: any) {
      setError(String(err));
    }
  }, [parseFile]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-500" />
            <h2 className="text-xl font-bold">Manifest Upload</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={() => inputRef.current?.click()} className="px-4 py-2 rounded-lg bg-slate-100">Choose file</button>
            <button onClick={handleLoadExample} className="px-4 py-2 rounded-lg bg-amber-500 text-white">Load example</button>
          </div>
        </div>

        <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleSelect} />

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}
        >
          <Upload className="mx-auto mb-4 text-slate-600" size={42} />
          <p className="text-sm text-slate-500 mb-4">Drop your <strong>manifest.json</strong> here or click "Choose file"</p>
          <p className="text-xs text-slate-400">Manifest is validated against the DTR schema. No network calls are made.</p>
        </div>

        <div className="mt-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="text-red-500" />
              <div>
                <div className="font-bold text-red-700">Error parsing manifest</div>
                <div className="text-sm text-red-600 mt-1">{error}</div>
              </div>
            </div>
          )}

          {manifest && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="text-green-600" />
                <div className="font-bold">Manifest loaded</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>Title</strong><div className="text-slate-600">{manifest.metadata.title}</div></div>
                <div><strong>Author</strong><div className="text-slate-600">{manifest.metadata.author ?? '-'}</div></div>
                <div><strong>Language</strong><div className="text-slate-600">{manifest.metadata.language ?? '-'}</div></div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Placeholders</div>
                <div className="grid grid-cols-2 gap-2">
                  {placeholders.map(ph => (
                    <div key={ph.name} className="p-3 rounded-lg bg-white border">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-black">{ph.name}</code>
                        <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-700">{ph.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2">section: {ph.sectionId}</div>
                    </div>
                  ))}
                </div>
              </div>

              {structureErrors.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Structure Warnings/Errors</div>
                  <ul className="space-y-2">
                    {structureErrors.map((e: any, i: number) => (
                      <li key={i} className={`p-3 rounded-lg ${e.severity === 'ERROR' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="text-[12px] font-bold">{e.code}</div>
                        <div className="text-sm text-slate-600">{e.message}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg" onClick={() => onManifestParsed(manifest, placeholders)}>Continue to Asset Mapping</button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManifestUpload;
