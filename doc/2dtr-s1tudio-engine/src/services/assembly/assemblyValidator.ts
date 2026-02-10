/**
 * AssemblyValidator
 * - Validate manifest vs mappings
 * - Detect missing placeholders, type mismatches, size warnings
 */

import type { AssemblyManifest, ProcessedAsset, ValidationError } from '../../types/assembly.types';
import { ManifestService } from './manifestService';

export interface ValidationResult {
  totalPlaceholders: number;
  mapped: number;
  missing: string[]; // placeholder names
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class AssemblyValidator {
  static validateManifestMappings(
    manifest: AssemblyManifest,
    mappings: Map<string, ProcessedAsset>
  ): ValidationResult {
    const placeholders = ManifestService.extractPlaceholders(manifest);
    const result: ValidationResult = {
      totalPlaceholders: placeholders.length,
      mapped: 0,
      missing: [],
      errors: [],
      warnings: []
    };

    for (const ph of placeholders) {
      const key = ph.name; // e.g. {{COVER_IMAGE}}
      const mapped = mappings.get(key);
      if (!mapped) {
        result.missing.push(key);
        result.errors.push({
          code: 'MISSING_PLACEHOLDER',
          severity: 'ERROR',
          message: `${key} is not mapped to any asset`,
          path: ph.sectionId
        });
        continue;
      }

      result.mapped++;

      // Type mismatch detection
      if (ph.type === 'workcard-html' && mapped.type !== 'workcard-html') {
        result.errors.push({
          code: 'TYPE_MISMATCH',
          severity: 'ERROR',
          message: `${key} expects HTML but mapped asset is ${mapped.type}`,
          path: ph.sectionId
        });
      }

      if (ph.type === 'raster' && mapped.type !== 'raster' && mapped.type !== 'vector') {
        result.errors.push({
          code: 'TYPE_MISMATCH',
          severity: 'ERROR',
          message: `${key} expects an image but mapped asset is ${mapped.type}`,
          path: ph.sectionId
        });
      }

      // Size warnings (file size > 5MB)
      if (mapped.size > 5_000_000) {
        result.warnings.push({
          code: 'FILE_TOO_LARGE',
          severity: 'WARNING',
          message: `${mapped.originalName} mapped to ${key} is larger than 5MB (${Math.round(mapped.size / 1024)} KB)`,
          path: ph.sectionId
        });
      }
    }

    return result;
  }
}
