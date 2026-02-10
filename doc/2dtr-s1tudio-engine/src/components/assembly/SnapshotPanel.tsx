import React, { useEffect, useState } from 'react';
import { Clock, Save, Trash2, RefreshCw } from 'lucide-react';
import type { Snapshot } from '../../services/shared/snapshotManager';

interface SnapshotPanelProps {
  projectId: string;
  onSave: (notes?: string) => Promise<void>;
  onLoad: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  listSnapshots: () => Promise<Snapshot[]>;
}

const SnapshotPanel: React.FC<SnapshotPanelProps> = ({ projectId, onSave, onLoad, onDelete, listSnapshots }) => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const refresh = async () => {
    setIsLoading(true);
    try {
      const s = await listSnapshots();
      setSnapshots(s);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [projectId]);

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock />
          <div>
            <div className="font-black text-sm">Snapshots</div>
            <div className="text-xs text-slate-500">Autosave keeps last 5</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setIsSaving(true);
              try {
                await onSave();
                setSavedMessage('Saved');
                // refresh list to show new snapshot quickly
                await refresh();
                setTimeout(() => setSavedMessage(''), 2000);
              } catch (err) {
                setSavedMessage('Save failed');
                setTimeout(() => setSavedMessage(''), 3000);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${isSaving ? 'bg-amber-300 text-white' : 'bg-amber-500 text-white'}`}>
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={refresh} className="px-3 py-2 bg-white border rounded-lg text-xs"><RefreshCw size={14} /></button>
        </div>
        {savedMessage && <div className="mt-2 text-xs text-emerald-600">{savedMessage}</div>
      </div>

      <div className="space-y-3">
        {isLoading && <div className="text-xs text-slate-500">Loading...</div>}
        {!isLoading && snapshots.length === 0 && <div className="text-xs text-slate-400">No snapshots available</div>}

        {snapshots.map(s => (
          <div key={s.id} className="p-3 bg-white rounded-lg border flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">{new Date(s.timestamp).toLocaleString()}</div>
              <div className="text-xs text-slate-500">{s.notes ?? 'Autosave'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onLoad(s.id)} className="px-3 py-2 bg-slate-100 rounded text-xs">Load</button>
              <button onClick={() => onDelete(s.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded text-xs"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnapshotPanel;
