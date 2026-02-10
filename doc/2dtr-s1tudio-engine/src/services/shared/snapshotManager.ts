/**
 * SnapshotManager
 * - Manages snapshots (versioned project states) using StorageService
 * - Keeps a capped history (e.g., last 5 autosaves)
 */

import { StorageService } from './storageService';
import type { AssemblyManifest, ProcessedAsset } from '../../types/assembly.types';

export interface Snapshot {
  id: string;
  projectId: string;
  timestamp: string;
  manifest?: AssemblyManifest;
  mappings?: [string, ProcessedAsset][];
  notes?: string;
}

const MAX_AUTOSAVES = 5;

export class SnapshotManager {
  private static indexKey(projectId: string) {
    return `snapIndex:${projectId}`;
  }

  static async saveSnapshot(projectId: string, manifest?: AssemblyManifest, mappings?: Map<string, ProcessedAsset>, notes?: string) {
    const id = `snap:${projectId}:${Date.now()}`;
    const snapshot: Snapshot = {
      id,
      projectId,
      timestamp: new Date().toISOString(),
      manifest: manifest ?? undefined,
      mappings: mappings ? Array.from(mappings.entries()) : undefined,
      notes
    };

    await window.storage.set(id, JSON.stringify(snapshot), false);

    // update index (prepend newest)
    try {
      const idxKey = SnapshotManager.indexKey(projectId);
      const existing = await window.storage.get(idxKey);
      let list: string[] = existing && existing.value ? JSON.parse(existing.value) : [];
      // ensure newest first
      list = [id, ...list.filter(x => x !== id)];
      // cap length
      if (list.length > MAX_AUTOSAVES) list = list.slice(0, MAX_AUTOSAVES);
      await window.storage.set(idxKey, JSON.stringify(list), false);
    } catch (err) {
      // non-fatal; continue
      console.warn('SnapshotManager: failed to update index', err);
    }

    // maintain autosave cap on storage keys as well
    await SnapshotManager._capSnapshots(projectId, MAX_AUTOSAVES);
    return snapshot;
  }

  static async listSnapshots(projectId: string): Promise<Snapshot[]> {
    try {
      const idxKey = SnapshotManager.indexKey(projectId);
      const idx = await window.storage.get(idxKey);
      if (!idx || !idx.value) return [];
      const ids: string[] = JSON.parse(idx.value);
      const snaps: Snapshot[] = [];
      for (const id of ids) {
        try {
          const r = await window.storage.get(id);
          if (r) snaps.push(JSON.parse(r.value));
        } catch (e) {
          // ignore missing snapshot
        }
      }
      return snaps.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (err) {
      // fallback to previous method (storage.list) if available
      try {
        if (typeof window.storage.list === 'function') {
          const keys = await window.storage.list(projectId);
          const snaps: Snapshot[] = [];
          for (const key of keys) {
            try {
              const r = await window.storage.get(key);
              if (r) snaps.push(JSON.parse(r.value));
            } catch {}
          }
          return snaps.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        }
      } catch {}
    }

    return [];
  }

  static async removeSnapshot(id: string) {
    try {
      // remove key
      await window.storage.remove(id);
      // update index
      const parts = id.split(':');
      if (parts.length >= 2) {
        const projectId = parts[1];
        const idxKey = SnapshotManager.indexKey(projectId);
        const idx = await window.storage.get(idxKey);
        if (idx && idx.value) {
          const ids: string[] = JSON.parse(idx.value);
          const filtered = ids.filter(x => x !== id);
          await window.storage.set(idxKey, JSON.stringify(filtered), false);
        }
      }
    } catch (err) {
      console.warn('removeSnapshot failed', err);
    }
  }

  static async addSnapshot(snapshot: Snapshot) {
    try {
      await window.storage.set(snapshot.id, JSON.stringify(snapshot), false);
      const idxKey = SnapshotManager.indexKey(snapshot.projectId);
      const existing = await window.storage.get(idxKey);
      let list: string[] = existing && existing.value ? JSON.parse(existing.value) : [];
      list = [snapshot.id, ...list.filter(x => x !== snapshot.id)];
      if (list.length > MAX_AUTOSAVES) list = list.slice(0, MAX_AUTOSAVES);
      await window.storage.set(idxKey, JSON.stringify(list), false);
    } catch (err) {
      console.warn('addSnapshot failed', err);
    }
  }

  private static async _capSnapshots(projectId: string, cap: number) {
    try {
      const idxKey = SnapshotManager.indexKey(projectId);
      const idx = await window.storage.get(idxKey);
      if (!idx || !idx.value) return;
      let ids: string[] = JSON.parse(idx.value);
      if (ids.length <= cap) return;
      const toRemove = ids.slice(cap);
      ids = ids.slice(0, cap);
      // update index to cap
      await window.storage.set(idxKey, JSON.stringify(ids), false);
      for (const id of toRemove) {
        try { await window.storage.remove(id); } catch {}
      }
    } catch (err) {
      // best-effort: fallback to listing
      const snaps = await SnapshotManager.listSnapshots(projectId);
      if (snaps.length <= cap) return;
      const toRemove = snaps.slice(cap);
      for (const s of toRemove) {
        try { await window.storage.remove(s.id); } catch {}
      }
    }
  }

  static async loadSnapshot(id: string): Promise<Snapshot | null> {
    try {
      const r = await window.storage.get(id);
      if (!r) return null;
      return JSON.parse(r.value) as Snapshot;
    } catch (err) {
      return null;
    }
  }
}
