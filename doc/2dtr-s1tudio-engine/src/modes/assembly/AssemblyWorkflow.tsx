import React, { useCallback, useEffect, useRef, useState } from 'react';
import ManifestUpload from './ManifestUpload';
import SnapshotPanel from '../../components/assembly/SnapshotPanel';
import AssetMappingPanel from '../../components/assembly/AssetMappingPanel';
import type { ValidationResult } from '../../services/assembly/assemblyValidator';
import { IncrementalValidator } from '../../services/assembly/incrementalValidator';
import { AssemblyValidator } from '../../services/assembly/assemblyValidator';
import type { AssemblyManifest, PlaceholderMapping, ProcessedAsset } from '../../types/assembly.types';
import { SnapshotManager } from '../../services/shared/snapshotManager';
import { StorageService } from '../../services/shared/storageService';
import ExportPanel from './ExportPanel';
import { CommandStack, SetMappingCommand, SaveSnapshotCommand } from '../../services/shared/commandStack';
import { RotateCcw, RotateCw } from 'lucide-react';

const AUTOSAVE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

const AssemblyWorkflow: React.FC = () => {
  const [manifest, setManifest] = useState<AssemblyManifest | null>(null);
  const [placeholders, setPlaceholders] = useState<PlaceholderMapping[]>([]);
  const [mappings, setMappings] = useState<Map<string, ProcessedAsset>>(new Map());
  const [step, setStep] = useState<'MANIFEST_UPLOAD' | 'ASSET_MAPPING' | 'VALIDATION' | 'EXPORT'>('MANIFEST_UPLOAD');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const projectIdRef = useRef<string | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  const commandStackRef = useRef<CommandStack>(new CommandStack());
  const [undoSize, setUndoSize] = useState(0);
  const [redoSize, setRedoSize] = useState(0);

  const handleManifestParsed = useCallback((m: AssemblyManifest, ph: PlaceholderMapping[]) => {
    setManifest(m);
    setPlaceholders(ph);
    // deterministic project id derived from title + timestamp
    projectIdRef.current = `proj:${m.metadata.title.replace(/\s+/g, '_').toLowerCase()}:${Date.now()}`;
    setStep('ASSET_MAPPING');
  }, []);

  // Autosave handler
  const saveSnapshot = useCallback(async (notes?: string) => {
    if (!projectIdRef.current) return;
    try {
      if (manifest) await StorageService.saveManifest(projectIdRef.current, manifest);
      // mappings may be empty initially
      await StorageService.saveMappings(projectIdRef.current, mappings);
      await SnapshotManager.saveSnapshot(projectIdRef.current, manifest ?? undefined, mappings, notes);
    } catch (err) {
      console.error('autosave error', err);
    }
  }, [manifest, mappings]);

  // start autosave when manifest present
  useEffect(() => {
    if (!manifest) return;
    // fire immediate save then set interval
    saveSnapshot('Autosave');
    autosaveTimer.current = window.setInterval(() => saveSnapshot('Autosave'), AUTOSAVE_INTERVAL_MS) as unknown as number;

    // keyboard shortcuts for undo/redo
    const handler = (e: KeyboardEvent) => {
      const mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrl = mac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        commandStackRef.current.undo();
        setUndoSize(commandStackRef.current.undoSize());
        setRedoSize(commandStackRef.current.redoSize());
      }
      if (e.key === 'y' || (e.shiftKey && (e.key === 'Z' || e.key === 'z'))) {
        e.preventDefault();
        commandStackRef.current.redo();
        setUndoSize(commandStackRef.current.undoSize());
        setRedoSize(commandStackRef.current.redoSize());
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      if (autosaveTimer.current) window.clearInterval(autosaveTimer.current);
      autosaveTimer.current = null;
      window.removeEventListener('keydown', handler);
    };
  }, [manifest, saveSnapshot]);

  const handleLoadSnapshot = useCallback(async (id: string) => {
    // create LoadSnapshotCommand and push to stack
    const apply = (manifestData?: any, mappingsArr?: [string, any][]) => {
      if (manifestData) setManifest(manifestData);
      if (mappingsArr) setMappings(new Map(mappingsArr));
      if (manifestData && manifestData.metadata) projectIdRef.current = `proj:${manifestData.metadata.title.replace(/\s+/g, '_').toLowerCase()}:${Date.now()}`;
      setStep('ASSET_MAPPING');
    };

    const cmd = new (class {
      async execute() {
        const snap = await SnapshotManager.loadSnapshot(id);
        if (!snap) return;
        // store prev state on this command instance
        (this as any).prev = { manifest: null, mappings: null };
        (this as any).prev.manifest = manifest;
        (this as any).prev.mappings = Array.from(mappings.entries());
        apply(snap.manifest, snap.mappings);
      }
      async undo() {
        const prev = (this as any).prev;
        if (!prev) return;
        apply(prev.manifest, prev.mappings);
      }
    })();

    await commandStackRef.current.push(cmd as any);
    setUndoSize(commandStackRef.current.undoSize());
    setRedoSize(commandStackRef.current.redoSize());
  }, [manifest, mappings]);

  const handleDeleteSnapshot = useCallback(async (id: string) => {
    const cmd = new (class {
      snapshotData: any = null;
      async execute() {
        this.snapshotData = await SnapshotManager.loadSnapshot(id);
        await SnapshotManager.removeSnapshot(id);
      }
      async undo() {
        if (!this.snapshotData) return;
        await SnapshotManager.addSnapshot(this.snapshotData);
      }
    })();

    await commandStackRef.current.push(cmd as any);
    setUndoSize(commandStackRef.current.undoSize());
    setRedoSize(commandStackRef.current.redoSize());
  }, []);

  const listSnapshots = useCallback(async () => {
    if (!projectIdRef.current) return [] as any;
    return SnapshotManager.listSnapshots(projectIdRef.current);
  }, []);

  return (
    <div className="p-12">
      {step === 'MANIFEST_UPLOAD' && (
        <div>
          <h1 className="text-3xl font-black mb-6">Assembly Workflow</h1>
          <ManifestUpload onManifestParsed={handleManifestParsed} />
        </div>
      )}

      {step === 'ASSET_MAPPING' && manifest && (
        <div>
          <div className="flex items-start justify-between mb-6 gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Asset Mapping</h2>
                <div className="text-sm text-slate-500">Manifest: <strong>{manifest.metadata.title}</strong></div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <div className="text-sm text-slate-600 mb-4">Placeholders detected ({placeholders.length})</div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div />
                      <div className="flex items-center gap-2">
                        <button
                          title="Undo (Ctrl/Cmd+Z)"
                          onClick={() => { commandStackRef.current.undo(); setUndoSize(commandStackRef.current.undoSize()); setRedoSize(commandStackRef.current.redoSize()); }}
                          className={`px-3 py-2 rounded ${commandStackRef.current.canUndo() ? 'bg-white border' : 'bg-slate-100 text-slate-400'}`}
                        >
                          <RotateCcw />
                        </button>
                        <button
                          title="Redo (Ctrl/Cmd+Y)"
                          onClick={() => { commandStackRef.current.redo(); setUndoSize(commandStackRef.current.undoSize()); setRedoSize(commandStackRef.current.redoSize()); }}
                          className={`px-3 py-2 rounded ${commandStackRef.current.canRedo() ? 'bg-white border' : 'bg-slate-100 text-slate-400'}`}
                        >
                          <RotateCw />
                        </button>
                      </div>
                    </div>

                    <AssetMappingPanel
                      placeholders={placeholders}
                      mappings={mappings}
                      onSetMapping={(placeholder, asset) => {
                        // Create a command and push to the stack (async push)
                        const prev = mappings.get(placeholder);
                        const cmd = new SetMappingCommand(placeholder, asset, (ph, a) => {
                          setMappings(prevM => {
                            const clone = new Map(prevM);
                            if (a) clone.set(ph, a);
                            else clone.delete(ph);
                            const val = AssemblyValidator.validateManifestMappings(manifest as any, clone);
                            setValidation(val);
                            return clone;
                          });
                        }, prev);

                        (async () => {
                          await commandStackRef.current.push(cmd);
                          setUndoSize(commandStackRef.current.undoSize());
                          setRedoSize(commandStackRef.current.redoSize());
                        })();
                    />
                  </div>

                  <div className="col-span-1 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border">
                      <div className="font-black mb-2">Validation</div>
                      <div className="text-sm text-slate-600">{validation ? `${validation.mapped}/${validation.totalPlaceholders} mapped` : 'No validation yet'}</div>
                      <div className="mt-3 text-xs text-slate-500">
                        {validation && validation.errors.length > 0 && (
                          <div className="text-red-600">Errors: {validation.errors.length}</div>
                        )}
                        {validation && validation.warnings.length > 0 && (
                          <div className="text-amber-600">Warnings: {validation.warnings.length}</div>
                        )}
                      </div>
                    </div>

                    <SnapshotPanel
                      projectId={projectIdRef.current ?? 'unsaved'}
                      onSave={async (notes?: string) => {
                        if (!projectIdRef.current) return;
                        const cmd = new SaveSnapshotCommand(projectIdRef.current, manifest ?? undefined, mappings, notes ?? 'Manual save');
                        await commandStackRef.current.push(cmd);
                        setUndoSize(commandStackRef.current.undoSize());
                        setRedoSize(commandStackRef.current.redoSize());
                      }}
                      onLoad={handleLoadSnapshot}
                      onDelete={handleDeleteSnapshot}
                      listSnapshots={listSnapshots}
                    />

                    <div className="bg-white p-4 rounded-2xl border">
                      <div className="font-black mb-2">Export</div>
                      <div className="text-sm text-slate-500">Ready for export? Go to the Export view to choose format and generate files.</div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => setStep('EXPORT')} className="px-3 py-2 bg-slate-900 text-white rounded">Open Export</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button className="px-4 py-2 rounded bg-slate-100" onClick={() => setStep('MANIFEST_UPLOAD')}>Back</button>
                  <button className="px-4 py-2 rounded bg-amber-500 text-white" onClick={() => setStep('VALIDATION')}>Run Validation</button>
                  <button className="px-4 py-2 rounded bg-slate-900 text-white" onClick={() => setStep('EXPORT')}>Go to Export</button>
                </div>
              </div>
            </div>

            <aside className="w-80">
              <SnapshotPanel
                projectId={projectIdRef.current ?? 'unsaved'}
                onSave={async (notes?: string) => {
                  if (!projectIdRef.current) return;
                  const cmd = new SaveSnapshotCommand(projectIdRef.current, manifest ?? undefined, mappings, notes ?? 'Manual save');
                  await commandStackRef.current.push(cmd);
                  setUndoSize(commandStackRef.current.undoSize());
                  setRedoSize(commandStackRef.current.redoSize());
                }}
                onLoad={handleLoadSnapshot}
                onDelete={handleDeleteSnapshot}
                listSnapshots={listSnapshots}
              />
            </aside>
          </div>
        </div>
      )}

      {step === 'EXPORT' && manifest && (
        <div>
          <h2 className="text-2xl font-black mb-4">Export</h2>
          <div className="p-6 bg-white rounded-2xl shadow">
            <ExportPanel manifest={manifest} mappings={mappings} />
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button className="px-4 py-2 rounded bg-slate-100" onClick={() => setStep('ASSET_MAPPING')}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyWorkflow;
