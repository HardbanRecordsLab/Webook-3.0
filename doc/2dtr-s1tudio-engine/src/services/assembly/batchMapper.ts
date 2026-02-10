/**
 * BatchMapper
 * - Utilities for auto-mapping assets to placeholders based on naming conventions or patterns
 */

import type { PlaceholderMapping } from '../../types/assembly.types';
import type { ProcessedAsset } from '../../types/assembly.types';

export class BatchMapper {
  /**
   * Auto-map assets by name: looks for placeholder token inside filename (case-insensitive)
   * e.g. file name: cover_IMAGE.JPG -> matches {{COVER_IMAGE}}
   */
  static autoMapByName(files: ProcessedAsset[], placeholders: PlaceholderMapping[]): Map<string, ProcessedAsset> {
    const result = new Map<string, ProcessedAsset>();

    // Precompute placeholder tokens without braces
    const tokens = placeholders.map(ph => ({ name: ph.name, token: ph.name.replace(/{{|}}/g, '').toLowerCase(), type: ph.type }));

    for (const f of files) {
      const fname = f.originalName.toLowerCase();
      for (const t of tokens) {
        // match token in filename or token parts separated by underscore/dash
        if (fname.includes(t.token.toLowerCase())) {
          // Avoid mapping if already mapped
          if (!result.has(t.name)) {
            result.set(t.name, f);
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Pattern-based mapping: supports mapping using regex or custom matcher functions
   */
  static autoMapByPattern(files: ProcessedAsset[], placeholders: PlaceholderMapping[], patternMap: Record<string, RegExp>) {
    const result = new Map<string, ProcessedAsset>();

    for (const ph of placeholders) {
      const p = patternMap[ph.name];
      if (!p) continue;
      for (const f of files) {
        if (p.test(f.originalName)) {
          result.set(ph.name, f);
          break;
        }
      }
    }

    return result;
  }
}
