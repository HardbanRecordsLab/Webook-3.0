import { describe, it, expect, beforeEach } from 'vitest';
import { CommandStack, SaveSnapshotCommand, DeleteSnapshotCommand } from '../commandStack';
import { SnapshotManager } from '../snapshotManager';

function createStorageMock() {
  const map = new Map<string, { value: string }>();
  return {
    async set(key: string, value: string) {
      map.set(key, { value });
      return true;
    },
    async get(key: string) {
      return map.has(key) ? { value: map.get(key)!.value } : null;
    },
    async remove(key: string) {
      map.delete(key);
      return true;
    },
    async list(projectId: string) {
      return Array.from(map.keys()).filter(k => k.startsWith(`snap:${projectId}:`));
    }
  } as any;
}

beforeEach(() => {
  // @ts-ignore - test harness global
  globalThis.window = globalThis.window || ({} as any);
  // install fresh storage mock per test
  // @ts-ignore
  window.storage = createStorageMock();
});

describe('Snapshot commands with CommandStack', () => {
  it('SaveSnapshotCommand saves a snapshot and undo removes it', async () => {
    const cs = new CommandStack();
    const projectId = 'proj:test:save:1';

    const cmd = new SaveSnapshotCommand(projectId, { metadata: { title: 'Test' } } as any, new Map([['p', { originalName: 'a' }]]), 'note');
    await cs.push(cmd);

    const snaps = await SnapshotManager.listSnapshots(projectId);
    expect(snaps.length).toBe(1);

    await cs.undo();
    const after = await SnapshotManager.listSnapshots(projectId);
    expect(after.length).toBe(0);
  });

  it('DeleteSnapshotCommand removes snapshot and undo restores it', async () => {
    const projectId = 'proj:test:delete:1';
    const snapshot = await SnapshotManager.saveSnapshot(projectId, { metadata: { title: 'T' } } as any, new Map([['p', { originalName: 'a' }]]), 'note');

    const cs = new CommandStack();
    const del = new DeleteSnapshotCommand(snapshot.id);
    await cs.push(del);

    const afterDel = await SnapshotManager.listSnapshots(projectId);
    expect(afterDel.length).toBe(0);

    await cs.undo();
    const restored = await SnapshotManager.listSnapshots(projectId);
    expect(restored.length).toBe(1);
    expect(restored[0].id).toBe(snapshot.id);
  });
});
