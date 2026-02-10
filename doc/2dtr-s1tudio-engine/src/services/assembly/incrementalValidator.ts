/**
 * IncrementalValidator
 * - Debounced real-time validator that emits ValidationResult updates
 */

import type { AssemblyManifest, ProcessedAsset } from '../../types/assembly.types';
import type { ValidationResult } from './assemblyValidator';
import { AssemblyValidator } from './assemblyValidator';

type Callback = (res: ValidationResult) => void;

export class IncrementalValidator {
  private timeout = 300;
  private timer: number | null = null;
  private listeners: Set<Callback> = new Set();

  constructor(debounceMs = 300) {
    this.timeout = debounceMs;
  }

  subscribe(cb: Callback) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  validate(manifest: AssemblyManifest, mappings: Map<string, ProcessedAsset>) {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      const res = AssemblyValidator.validateManifestMappings(manifest, mappings);
      for (const cb of this.listeners) cb(res);
      this.timer = null;
    }, this.timeout);
  }
}
