/**
 * AssetProcessor
 * - Responsible for processing different asset types (HTML, images, audio)
 * - Produces ProcessedAsset objects ready for mapping/export
 *
 * Security & performance guidelines followed:
 * - Images processed off-main-thread when OffscreenCanvas is available
 * - HTML is sanitized via HTMLSanitizer
 */

import type {
  AssetType,
  ProcessingConfig,
  ProcessedAsset
} from '../../types/assembly.types';
import { HTMLSanitizer, AssemblyError } from './htmlSanitizer';

/**
 * Helper to create object URL safely and include size/checksum
 */
async function blobToUrl(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob);
}

export class AssetProcessor {
  /**
   * Dispatch to specific processors based on type
   */
  static async process(file: File, type: AssetType, config: ProcessingConfig = {}): Promise<ProcessedAsset> {
    switch (type) {
      case 'workcard-html':
        return this.processHTML(file, config);
      case 'raster':
        return this.processImage(file, config);
      case 'audio':
        return this.processAudio(file, config);
      default:
        return this.processGeneric(file, type);
    }
  }

  private static async processHTML(file: File): Promise<ProcessedAsset> {
    const text = await file.text();
    // sanitize strictly
    let clean: string;
    try {
      clean = HTMLSanitizer.sanitize(text, true);
    } catch (err) {
      if (err instanceof AssemblyError) throw err;
      throw new Error('HTML_SANITIZE_ERROR');
    }

    const blob = new Blob([clean], { type: 'text/html' });
    const url = await blobToUrl(blob);
    const checksum = await this.generateChecksum(blob);

    return {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      originalName: file.name,
      type: 'workcard-html',
      blob,
      url,
      checksum,
      size: blob.size,
      meta: { mime: 'text/html' }
    };
  }

  private static async processImage(file: File, config: ProcessingConfig = {}): Promise<ProcessedAsset> {
    const maxW = config.maxWidth ?? 1600;
    const maxH = config.maxHeight ?? 1600;
    const quality = typeof config.quality === 'number' ? config.quality : 0.85;

    // decode image into ImageBitmap
    const bitmap = await createImageBitmap(file);
    let targetW = bitmap.width;
    let targetH = bitmap.height;

    // compute scale
    const ratio = Math.min(1, Math.min(maxW / bitmap.width, maxH / bitmap.height));
    targetW = Math.max(1, Math.round(bitmap.width * ratio));
    targetH = Math.max(1, Math.round(bitmap.height * ratio));

    // use OffscreenCanvas when available
    const canvas: OffscreenCanvas | HTMLCanvasElement = (typeof OffscreenCanvas !== 'undefined')
      ? new OffscreenCanvas(targetW, targetH)
      : (document.createElement('canvas') as HTMLCanvasElement);

    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = (canvas as any).getContext('2d');
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    // convert to WebP blob
    const blob: Blob = await new Promise((resolve, reject) => {
      if ('convertToBlob' in canvas) {
        // OffscreenCanvas
        (canvas as OffscreenCanvas).convertToBlob({ type: 'image/webp', quality }).then(resolve).catch(reject);
      } else {
        // HTMLCanvasElement
        (canvas as HTMLCanvasElement).toBlob(b => {
          if (!b) return reject(new Error('CANVAS_TO_BLOB_FAILED'));
          resolve(b);
        }, 'image/webp', quality);
      }
    });

    const url = await blobToUrl(blob);
    const checksum = await this.generateChecksum(blob);

    return {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      originalName: file.name,
      type: 'raster',
      blob,
      url,
      checksum,
      size: blob.size,
      meta: { width: targetW, height: targetH, mime: 'image/webp' }
    };
  }

  private static async processAudio(file: File): Promise<ProcessedAsset> {
    // Basic validation + metadata extraction (duration) using Audio element
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.src = url;

    const duration: number = await new Promise(resolve => {
      const t = setTimeout(() => resolve(0), 2000); // fallback if metadata not available fast
      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(t);
        resolve(isFinite(audio.duration) ? audio.duration : 0);
      });
      // try to load metadata
      audio.load();
    });

    const checksum = await this.generateChecksum(file);

    return {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      originalName: file.name,
      type: 'audio',
      blob: file,
      url,
      checksum,
      size: file.size,
      meta: { duration, mime: file.type }
    };
  }

  private static async processGeneric(file: File, type: AssetType): Promise<ProcessedAsset> {
    const blob = file.slice();
    const url = URL.createObjectURL(blob);
    const checksum = await this.generateChecksum(blob);
    return {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      originalName: file.name,
      type,
      blob,
      url,
      checksum,
      size: blob.size,
      meta: { mime: file.type }
    };
  }

  private static async generateChecksum(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
