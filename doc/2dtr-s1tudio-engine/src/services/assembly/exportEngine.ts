import type { AssemblyManifest, ProcessedAsset } from '../../types/assembly.types';
import { PlaceholderParser } from './placeholderParser';
import type { ExportResult } from '../../types/shared.types';

/**
 * ExportEngine
 * - exportHTML: returns a downloadable HTML file (object URL)
 * - exportPDF/exportEPUB: use Web Workers to perform heavy export
 */

export class ExportEngine {
  static async assembleHTML(manifest: AssemblyManifest, mappings: Map<string, ProcessedAsset>): Promise<string> {
    // Start with a minimal container: iterate sections and inject placeholders
    let content = '';

    for (const section of manifest.sections) {
      // section header
      content += `<section data-section="${escapeAttr(section.id)}"><h2>${escapeHtml(section.title)}</h2>`;
      // for each placeholder in section, create a placeholder token and replace with mapped asset
      for (const ph of section.placeholders) {
        const name = ph; // e.g. {{COVER_IMAGE}}
        const mapped = mappings.get(name);

      if (mapped) {
        // create payload depending on asset type
        if (mapped.type === 'workcard-html') {
          // payload: sanitized HTML
          const payload = await mapped.blob.text();
          // Use HTMLSanitizer to ensure safety
          const { HTMLSanitizer } = await import('./htmlSanitizer');
          const safe = HTMLSanitizer.sanitize(payload, true);
          content += `<div class=\"workcard-html\">${safe}</div>`;
        } else if (mapped.type === 'raster') {
          content += `<div class=\"workcard-image\"><img src=\"${mapped.url}\" alt=\"${escapeAttr(mapped.originalName)}\"/></div>`;
        } else if (mapped.type === 'audio') {
          content += `<div class=\"workcard-audio\"><audio controls src=\"${mapped.url}\"></audio></div>`;
        } else {
          content += `<div class=\"asset\"><a href=\"${mapped.url}\" download>${mapped.originalName}</a></div>`;
        }
      } else {
        // leave placeholder visible for debugging
        content += `<div class=\"missing\">${name}</div>`;
      content += '</section>';
    }

    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(manifest.metadata.title)}</title></head><body>${content}</body></html>`;
  }

  static async exportHTML(manifest: AssemblyManifest, mappings: Map<string, ProcessedAsset>): Promise<ExportResult> {
    const assembled = await this.assembleHTML(manifest, mappings);
    const blob = new Blob([assembled], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return { success: true, format: 'html', size: blob.size, downloadURL: url, metadata: { generatedAt: new Date().toISOString() } };
  }

  static async exportPDF(manifest: AssemblyManifest, mappings: Map<string, ProcessedAsset>, onProgress?: (p: number) => void): Promise<ExportResult> {
    return new Promise(async (resolve, reject) => {
      const assembled = await this.assembleHTML(manifest, mappings);
      const worker = new Worker(new URL('../../workers/pdf.worker.ts', import.meta.url));
      worker.onmessage = (e) => {
        const data = (e.data as any);
        if (typeof data.progress === 'number') {
          onProgress?.(data.progress);
          return;
        }
        if (!data.success) return reject(new Error(data.error || 'Export failed'));
        const bytes = data.data as Uint8Array;
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        resolve({ success: true, format: 'pdf', size: blob.size, downloadURL: url, metadata: { generatedAt: new Date().toISOString() } });
        worker.terminate();
      };
      worker.postMessage({ type: 'generate-pdf', html: assembled, title: manifest.metadata.title });
    });
  }

  static async exportEPUB(manifest: AssemblyManifest, mappings: Map<string, ProcessedAsset>, onProgress?: (p: number) => void): Promise<ExportResult> {
    return new Promise(async (resolve, reject) => {
      const assembled = await this.assembleHTML(manifest, mappings);
      const worker = new Worker(new URL('../../workers/epub.worker.ts', import.meta.url));
      worker.onmessage = (e) => {
        const data = (e.data as any);
        if (typeof data.progress === 'number') {
          onProgress?.(data.progress);
          return;
        }
        if (!data.success) return reject(new Error(data.error || 'Export failed'));
        const bytes = data.data as Uint8Array;
        const blob = new Blob([bytes], { type: 'application/epub+zip' });
        const url = URL.createObjectURL(blob);
        resolve({ success: true, format: 'epub', size: blob.size, downloadURL: url, metadata: { generatedAt: new Date().toISOString() } });
        worker.terminate();
      };
      worker.postMessage({ type: 'generate-epub', html: assembled, manifest: manifest.metadata });
    });
  }
}

function escapeHtml(s: string) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeAttr(s: string) { return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
