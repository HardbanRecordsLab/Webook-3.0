import { beforeEach, describe, expect, it } from 'vitest';
import { CommandStack, SaveSnapshotCommand, DeleteSnapshotCommand } from './commandStack';
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
    _store: store,
  } as any;
}

describe('Snapshot Commands (integration)', () => {
  beforeEach(() => {
    (window as any).storage = createMockStorage();
  });

  it('SaveSnapshotCommand creates and undo removes snapshot', async () => {
    const proj = 'proj:cmdsave';
    const cmdStack = new CommandStack();
    const cmd = new SaveSnapshotCommand(proj, { metadata: { title: 'My' } } as any, undefined, 'note');
    await cmdStack.push(cmd);
    let snaps = await SnapshotManager.listSnapshots(proj);
    expect(snaps.length).toBe(1);

    await cmdStack.undo();
    snaps = await SnapshotManager.listSnapshots(proj);
    expect(snaps.length).toBe(0);

    // redo should recreate (note: new snapshot id may differ)
    await cmdStack.redo();
    snaps = await SnapshotManager.listSnapshots(proj);
    expect(snaps.length).toBe(1);
  });

  it('DeleteSnapshotCommand removes and undo re-adds same snapshot', async () => {
    const proj = 'proj:cmddel';
    const saved = await SnapshotManager.saveSnapshot(proj, { metadata: { title: 'X' } } as any, undefined, 'note');
    let snaps = await SnapshotManager.listSnapshots(proj);
    expect(snaps.length).toBe(1);

    const cmd = new DeleteSnapshotCommand(saved.id);
    const cs = new CommandStack();
    await cs.push(cmd);

    snaps = await SnapshotManager.listSnapshots(proj);
    expect(snaps.length).toBe(0);

    await cs.undo();
    snaps = await SnapshotManager.listSnapshots(proj);
    expect(snaps.length).toBe(1);
    expect(snaps[0].id).toBe(saved.id);
  });
});
