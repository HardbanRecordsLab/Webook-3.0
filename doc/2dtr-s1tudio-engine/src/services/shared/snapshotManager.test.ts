import { beforeEach, describe, expect, it } from 'vitest';
import { SnapshotManager } from './snapshotManager';

function createMockStorage() {
  const store = new Map<string, { value: string }>();

  return {
    get: async (k: string) => {
      const v = store.get(k);
      return v ?? null;
    },
    set: async (k: string, value: string) => {
      store.set(k, { value });
    },
    remove: async (k: string) => {
      store.delete(k);
    },
    list: async (projectId: string) => {
      const keys: string[] = [];
      for (const key of store.keys()) {
        if (key.includes(projectId)) keys.push(key);
      }
      return keys;
    },
    // helper for tests
    _store: store,
  } as any;
}

describe('SnapshotManager', () => {
  beforeEach(() => {
    (window as any).storage = createMockStorage();
  });

  it('saves and lists snapshots', async () => {
    const proj = 'proj:test';
    const snap = await SnapshotManager.saveSnapshot(proj, { metadata: { title: 'X' } } as any, undefined, 'note');
    const list = await SnapshotManager.listSnapshots(proj);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(snap.id);
  });

  it('caps autosaves to MAX_AUTOSAVES', async () => {
    const proj = 'proj:captest';
    // create 6 snapshots in a row
    for (let i = 0; i < 6; i++) {
      // small delay to ensure different timestamps
      // eslint-disable-next-line no-await-in-loop
      await SnapshotManager.saveSnapshot(proj, { metadata: { title: `T${i}` } } as any, undefined, `n${i}`);
    }
    const list = await SnapshotManager.listSnapshots(proj);
    // MAX_AUTOSAVES is 5 in implementation
    expect(list.length).toBe(5);
  });

  it('removes and adds snapshot', async () => {
    const proj = 'proj:removeadd';
    const snap = await SnapshotManager.saveSnapshot(proj, { metadata: { title: 'X' } } as any, undefined, 'note');
    await SnapshotManager.removeSnapshot(snap.id);
    let list = await SnapshotManager.listSnapshots(proj);
    expect(list.length).toBe(0);
    // add snapshot back with addSnapshot
    await SnapshotManager.addSnapshot(snap);
    list = await SnapshotManager.listSnapshots(proj);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(snap.id);
  });
});
