import React, { useState } from 'react';
import { Download, Loader2, Globe, BookOpen } from 'lucide-react';
import type { AssemblyManifest } from '../../types/assembly.types';
import { ExportEngine } from '../../services/assembly/exportEngine';

interface ExportPanelProps {
  manifest: AssemblyManifest;
  mappings: Map<string, any>;
}

const PROFILES = [
  { id: 'web', name: 'Web HTML', desc: 'Download assembled HTML for web distribution', format: 'html' },
  { id: 'pdf', name: 'Print PDF', desc: 'Print-ready PDF (worker-generated)', format: 'pdf' },
  { id: 'epub', name: 'EPUB', desc: 'eBook EPUB package (worker-generated)', format: 'epub' }
];

const ExportPanel: React.FC<ExportPanelProps> = ({ manifest, mappings }) => {
  const [profile, setProfile] = useState(PROFILES[0].id);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string | null>(null);

  const startExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setResultUrl(null);
    try {
      let res: any;
      if (profile === 'web') {
        res = await ExportEngine.exportHTML(manifest, mappings);
      } else if (profile === 'pdf') {
        res = await ExportEngine.exportPDF(manifest, mappings, (p) => setProgress(p));
      } else if (profile === 'epub') {
        res = await ExportEngine.exportEPUB(manifest, mappings, (p) => setProgress(p));
      }

      setResultUrl(res.downloadURL);
      setResultName(`${manifest.metadata.title || 'export'}.${res.format}`);
      setProgress(100);
    } catch (err) {
      console.error('export error', err);
      setResultUrl(null);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-black text-lg mb-4">Export</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          {PROFILES.map(p => (
            <button key={p.id} onClick={() => setProfile(p.id)} className={`px-4 py-2 rounded ${profile === p.id ? 'bg-amber-500 text-white' : 'bg-slate-50'}`}>
              {p.name}
            </button>
          ))}
        </div>

        <div className="text-sm text-slate-500">Profile: {PROFILES.find(p => p.id === profile)?.desc}</div>

        <div className="flex gap-3 mt-4">
          <button onClick={startExport} disabled={isExporting} className="px-4 py-2 bg-slate-900 text-white rounded">
            {isExporting ? <><Loader2 className="animate-spin" /> Exporting...</> : <><Download /> Start Export</>}
          </button>
          {resultUrl && (
            <a href={resultUrl} download={resultName ?? undefined} className="px-4 py-2 bg-amber-500 text-white rounded flex items-center gap-2">Download</a>
          )}
        </div>

        {progress !== null && (
          <div className="mt-4">
            <div className="text-xs text-slate-500">Progress: {progress}%</div>
            <div className="w-full bg-slate-100 rounded h-2 mt-1">
              <div style={{ width: `${progress}%` }} className="h-2 bg-amber-500 rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPanel;
