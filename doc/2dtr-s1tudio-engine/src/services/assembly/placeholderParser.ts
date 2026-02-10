/**
 * PlaceholderParser
 * - Utility to find placeholders inside arbitrary HTML/text and to inject assets
 */

import type { PlaceholderMapping } from '../../types/assembly.types';
import { HTMLSanitizer } from './htmlSanitizer';

const PLACEHOLDER_REGEX = /{{\s*([A-Z0-9_\-]+)\s*}}/g;

export interface PlaceholderOccurrence {
  name: string; // e.g. {{COVER_IMAGE}}
  token: string; // captured token without braces e.g. COVER_IMAGE
  index: number; // offset in the source string
  snippet: string; // small context around occurrence
}

export class PlaceholderParser {
  /**
   * Find all placeholder occurrences in provided html/text and return them
   */
  static findPlaceholdersInHTML(source: string): PlaceholderOccurrence[] {
    const out: PlaceholderOccurrence[] = [];

    let match: RegExpExecArray | null;
    while ((match = PLACEHOLDER_REGEX.exec(source)) !== null) {
      const token = match[1];
      const name = `{{${token}}}`;
      const index = match.index;
      const before = source.slice(Math.max(0, index - 40), index);
      const after = source.slice(index, Math.min(source.length, index + 80));
      const snippet = `${before}${after}`.replace(/\s+/g, ' ');

      out.push({ name, token, index, snippet });
    }

    return out;
  }

  /**
   * Inject an asset into the HTML by replacing the placeholder token.
   * - For HTML content: sanitize and insert
   * - For images/audio: create an appropriate tag
   * Returns the new HTML string.
   */
  static injectAsset(
    html: string,
    placeholderName: string,
    asset: { type: 'html' | 'image' | 'audio' | 'other'; payload: string },
    options?: { alt?: string }
  ): string {
    if (!PLACEHOLDER_REGEX.test(placeholderName)) {
      throw new Error('PLACEHOLDER_NAME_INVALID');
    }

    let replacement = '';

    switch (asset.type) {
      case 'html':
        // sanitize user-supplied snippet before injecting
        replacement = HTMLSanitizer.sanitize(asset.payload, true);
        break;
      case 'image':
        // payload is expected to be an object URL or relative path
        replacement = `<img src="${escapeAttr(asset.payload)}" alt="${escapeAttr(options?.alt ?? '')}" class="dtr-image" />`;
        break;
      case 'audio':
        replacement = `<audio controls src="${escapeAttr(asset.payload)}" class="dtr-audio"></audio>`;
        break;
      default:
        replacement = `<a href="${escapeAttr(asset.payload)}" target="_blank" rel="noreferrer noopener">${escapeAttr(asset.payload)}</a>`;
    }

    // Replace all occurrences of the placeholder
    const token = new RegExp(escapeRegExp(placeholderName), 'g');
    return html.replace(token, () => replacement);
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function escapeAttr(s: string): string {
  return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
