/**
 * CommandStack - simple undo/redo stack using Command Pattern
 */

export interface ICommand {
  execute(): Promise<void> | void;
  undo(): Promise<void> | void;
}

export class CommandStack {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private maxSize: number;

  constructor(maxSize = 200) {
    this.maxSize = maxSize;
  }

  async push(cmd: ICommand) {
    // execute (await if async) then push to undo stack
    await cmd.execute();
    this.undoStack.push(cmd);
    // clear redo on new action
    this.redoStack = [];
    // enforce max size
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
  }

  async undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    await cmd.undo();
    this.redoStack.push(cmd);
  }

  async redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    await cmd.execute();
    this.undoStack.push(cmd);
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
  undoSize() { return this.undoStack.length; }
  redoSize() { return this.redoStack.length; }
}

/**
 * SetMappingCommand - specific command that applies a mapping change
 */
export class SetMappingCommand implements ICommand {
  constructor(
    private placeholder: string,
    private newAsset: any | undefined,
    private apply: (placeholder: string, asset: any | undefined) => void,
    private prevAsset: any | undefined
  ) {}

  async execute(): Promise<void> {
    this.apply(this.placeholder, this.newAsset);
  }

  async undo(): Promise<void> {
    this.apply(this.placeholder, this.prevAsset);
  }
}

/**
 * Snapshot-related commands
 */
import { SnapshotManager, Snapshot } from './snapshotManager';
import { StorageService } from './storageService';

export class SaveSnapshotCommand implements ICommand {
  private snapshot?: Snapshot;
  constructor(private projectId: string, private manifest: any | undefined, private mappings?: Map<string, any>, private notes?: string) {}

  async execute(): Promise<void> {
    // perform save and keep snapshot data for undo
    this.snapshot = await SnapshotManager.saveSnapshot(this.projectId, this.manifest, this.mappings, this.notes);
  }

  async undo(): Promise<void> {
    if (!this.snapshot) return;
    await SnapshotManager.removeSnapshot(this.snapshot.id);
  }
}

export class DeleteSnapshotCommand implements ICommand {
  private snapshotData?: Snapshot | null = null;
  constructor(private snapshotId: string) {}

  async execute(): Promise<void> {
    this.snapshotData = await SnapshotManager.loadSnapshot(this.snapshotId);
    if (!this.snapshotData) return;
    await SnapshotManager.removeSnapshot(this.snapshotId);
  }

  async undo(): Promise<void> {
    if (!this.snapshotData) return;
    await SnapshotManager.addSnapshot(this.snapshotData);
  }
}

export class LoadSnapshotCommand implements ICommand {
  private prevState?: { manifest?: any; mappings?: [string, any][] };
  private loadedSnapshot?: Snapshot | null = null;
  constructor(private snapshotId: string, private apply: (manifest?: any, mappings?: [string, any][]) => void) {}

  async execute(): Promise<void> {
    // save previous state
    // Note: apply should expose a getter-like behavior via closure if needed; here we rely on caller to capture previous state outside if needed
    this.loadedSnapshot = await SnapshotManager.loadSnapshot(this.snapshotId);
    if (!this.loadedSnapshot) return;
    // store previous by asking caller (caller should pass closure that returns previous state or we expect apply to set state and return previous state)
    // For simplicity, we will ask caller to provide previous state via a separate setter before calling push.
    this.apply(this.loadedSnapshot.manifest, this.loadedSnapshot.mappings);
  }

  async undo(): Promise<void> {
    if (!this.prevState) return;
    this.apply(this.prevState.manifest, this.prevState.mappings);
  }
}

