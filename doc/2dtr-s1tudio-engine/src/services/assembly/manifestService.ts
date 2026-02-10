/**
 * ManifestService
 * - Parse and validate manifest.json files
 * - Extract placeholders
 *
 * NOTE: This module depends on `ajv`. Install with:
 *   npm install ajv
 */

import Ajv, { ErrorObject } from 'ajv';
import manifestSchema from '../../schemas/manifest.schema.json';
import type {
  AssemblyManifest,
  PlaceholderMapping,
  ValidationError
} from '../../types/assembly.types';

const PLACEHOLDER_REGEX = /{{\s*([A-Z0-9_\-]+)\s*}}/g;

export class ManifestService {
  private static ajv = new Ajv({ allErrors: true, strict: false });
  private static validator = ManifestService.ajv.compile(manifestSchema as object);

  /**
   * Parse a File object containing JSON manifest and validate against schema.
   * Throws a detailed Error when parsing/validation fails.
   */
  static async parseManifest(file: File): Promise<AssemblyManifest> {
    const text = await file.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error('MANIFEST_PARSE_ERROR: Invalid JSON');
    }

    const valid = ManifestService.validator(parsed);
    if (!valid) {
      const err = ManifestService.validator.errors as ErrorObject[] | null;
      const message = (err || []).map(e => `${e.instancePath || '/'} ${e.message}`).join('; ');
      throw new Error(`MANIFEST_SCHEMA_ERROR: ${message}`);
    }

    return parsed as AssemblyManifest;
  }

  /**
   * Extract all placeholders from manifest sections.
   * Returns unique PlaceholderMapping entries with best-effort type detection.
   */
  static extractPlaceholders(manifest: AssemblyManifest): PlaceholderMapping[] {
    const out: Map<string, PlaceholderMapping> = new Map();

    for (const section of manifest.sections) {
      for (const ph of section.placeholders) {
        const m = PLACEHOLDER_REGEX.exec(ph);
        // reset lastIndex for next run
        PLACEHOLDER_REGEX.lastIndex = 0;
        if (!m) continue;
        const name = `{{${m[1]}}}`;

        // naive type inference based on name tokens
        const key = m[1];
        let type: PlaceholderMapping['type'] = 'other';
        if (/HTML|HTML_SNIPPET|WORKCARD|CONTENT/.test(key)) type = 'workcard-html';
        else if (/IMG|IMAGE|COVER|PHOTO/.test(key)) type = 'raster';
        else if (/SVG|VECTOR/.test(key)) type = 'vector';
        else if (/AUDIO|SOUND|MP3|WAV/.test(key)) type = 'audio';

        const mapping: PlaceholderMapping = {
          name,
          sectionId: section.id,
          type,
          required: true,
          resolved: false
        };

        // Avoid duplicates; prefer first occurrence (stable determinism)
        if (!out.has(name)) out.set(name, mapping);
      }
    }

    return Array.from(out.values());
  }

  /**
   * Validate manifest structure beyond JSON schema:
   * - chapter/section ordering
   * - duplicate placeholders
   * - placeholder format
   */
  static validateStructure(manifest: AssemblyManifest): ValidationError[] {
    const errors: ValidationError[] = [];

    // 1. Section ordering: ensure order is unique and sequential (if provided)
    const orders = new Set<number>();
    for (const s of manifest.sections) {
      if (typeof s.order === 'number') {
        if (orders.has(s.order)) {
          errors.push({
            code: 'DUPLICATE_SECTION_ORDER',
            severity: 'ERROR',
            message: `Section order ${s.order} is duplicated`,
            path: `sections.${s.id}.order`
          });
        }
        orders.add(s.order);
      }
    }

    // 2. Placeholder duplicates across sections
    const placeholderIndex = new Map<string, string>();
    for (const s of manifest.sections) {
      for (const ph of s.placeholders) {
        const m = PLACEHOLDER_REGEX.exec(ph);
        PLACEHOLDER_REGEX.lastIndex = 0;
        if (!m) {
          errors.push({
            code: 'INVALID_PLACEHOLDER_FORMAT',
            severity: 'ERROR',
            message: `Invalid placeholder format: ${ph}`,
            path: `sections.${s.id}`
          });
          continue;
        }
        const name = `{{${m[1]}}}`;
        if (placeholderIndex.has(name)) {
          errors.push({
            code: 'DUPLICATE_PLACEHOLDER',
            severity: 'WARNING',
            message: `${name} appears in both ${placeholderIndex.get(name)} and ${s.id}`,
            path: `sections.${s.id}`
          });
        } else {
          placeholderIndex.set(name, s.id);
        }
      }
    }

    // 3. Basic path checks (manifest.assets)
    if (manifest.assets) {
      const checkPaths = (arr: string[] | undefined, key: string) => {
        if (!arr) return;
        for (const p of arr) {
          if (typeof p !== 'string' || !p.trim()) {
            errors.push({
              code: 'INVALID_ASSET_PATH',
              severity: 'ERROR',
              message: `Invalid asset path in ${key}: "${String(p)}"`,
              path: `assets.${key}`
            });
          }
        }
      };
      checkPaths(manifest.assets.css, 'css');
      checkPaths(manifest.assets.scripts, 'scripts');
    }

    return errors;
  }
}
