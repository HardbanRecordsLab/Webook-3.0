/**
 * StorageService
 * - Wrapper around `window.storage` API as required (no localStorage)
 * - Supports chunking for large mappings
 */

import type { AssemblyManifest, ProcessedAsset } from '../../types/assembly.types';

const CHUNK_SIZE = 4_000_000; // 4MB chunks for large serialized mappings

export class StorageService {
  /**
   * Save manifest for a projectId
   */
  static async saveManifest(projectId: string, manifest: AssemblyManifest): Promise<void> {
    await window.storage.set(`manifest:${projectId}`, JSON.stringify(manifest), false);
  }

  /**
   * Save mappings (Map<string, ProcessedAsset>) with chunking
   */
  static async saveMappings(projectId: string, mappings: Map<string, ProcessedAsset>): Promise<void> {
    const entries = Array.from(mappings.entries());
    const serialized = JSON.stringify(entries);

    if (serialized.length > 5_000_000) {
      // split into chunks
      for (let i = 0; i < serialized.length; i += CHUNK_SIZE) {
        const chunk = serialized.slice(i, i + CHUNK_SIZE);
        await window.storage.set(`mappings:${projectId}:chunk${i / CHUNK_SIZE}`, chunk, false);
      }
      // remove direct key if present
      try { await window.storage.remove(`mappings:${projectId}`); } catch { /* ignore */ }
    } else {
      await window.storage.set(`mappings:${projectId}`, serialized, false);
      // remove potential leftover chunks
      let idx = 0;
      while (true) {
        try {
          const key = `mappings:${projectId}:chunk${idx}`;
          const r = await window.storage.get(key);
          if (!r) break;
          await window.storage.remove(key);
          idx++;
        } catch {
          break;
        }
      }
    }
  }

  /**
   * Load project manifest + mappings
   */
  static async loadProject(projectId: string): Promise<{ manifest: AssemblyManifest; mappings: Map<string, ProcessedAsset> } | null> {
    try {
      const manifestResult = await window.storage.get(`manifest:${projectId}`);
      if (!manifestResult) return null;
      const manifest = JSON.parse(manifestResult.value) as AssemblyManifest;

      // Try direct mappings key first
      let mappingsData = '';
      try {
        const direct = await window.storage.get(`mappings:${projectId}`);
        if (direct && typeof direct.value === 'string' && direct.value.length > 0) {
          mappingsData = direct.value;
        } else {
          // load chunks
          let chunkIndex = 0;
          while (true) {
            const chunkKey = `mappings:${projectId}:chunk${chunkIndex}`;
            const chunk = await window.storage.get(chunkKey);
            if (!chunk) break;
            mappingsData += chunk.value;
            chunkIndex++;
          }
        }
      } catch {
        // swallow and try chunks
        let chunkIndex = 0;
        while (true) {
          try {
            const chunk = await window.storage.get(`mappings:${projectId}:chunk${chunkIndex}`);
            if (!chunk) break;
            mappingsData += chunk.value;
            chunkIndex++;
          } catch {
            break;
          }
        }
      }

      const mappingsArr: [string, ProcessedAsset][] = mappingsData ? JSON.parse(mappingsData) : [];
      return { manifest, mappings: new Map(mappingsArr) };
    } catch (err) {
      console.error('StorageService.loadProject error', err);
      return null;
    }
  }

  static async removeProject(projectId: string): Promise<void> {
    try {
      await window.storage.remove(`manifest:${projectId}`);
    } catch { /* ignore */ }

    // Remove mappings and chunks
    try {
      await window.storage.remove(`mappings:${projectId}`);
    } catch { /* ignore */ }

    let idx = 0;
    while (true) {
      try {
        const key = `mappings:${projectId}:chunk${idx}`;
        const r = await window.storage.get(key);
        if (!r) break;
        await window.storage.remove(key);
        idx++;
      } catch {
        break;
      }
    }
  }
}
