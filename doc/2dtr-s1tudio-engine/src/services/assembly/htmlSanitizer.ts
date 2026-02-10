/**
 * HTMLSanitizer
 * - Security critical utility: pattern checks + DOMPurify + sandbox wrapper
 *
 * NOTE: Install `dompurify` for browser usage:
 *   npm install dompurify
 */

import DOMPurify from 'dompurify';

export class AssemblyError extends Error {
  code: string;
  severity: 'ERROR' | 'WARNING';
  constructor(code: string, severity: 'ERROR' | 'WARNING', message: string) {
    super(message);
    this.code = code;
    this.severity = severity;
    Object.setPrototypeOf(this, AssemblyError.prototype);
  }
}

export class HTMLSanitizer {
  private static FORBIDDEN_PATTERNS = [
    /javascript:/gi,
    /on\w+=/gi,
    /<script/gi,
    /<iframe/gi,
    /eval\(/gi
  ];

  private static ALLOWED_TAGS = (
    DOMPurify as unknown as { isSupported?: () => boolean }
  )
    ? undefined
    : undefined; // let DOMPurify defaults be used when undefined

  private static ALLOWED_ATTRS = ['href', 'src', 'alt', 'title', 'class', 'style', 'role', 'aria-*'];

  /**
   * Sanitize provided HTML string and wrap in sandbox container.
   * Throws AssemblyError on security violations.
   */
  static sanitize(html: string, strict = true): string {
    // Layer 1: forbidden patterns
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(html)) {
        throw new AssemblyError('SECURITY_VIOLATION', 'ERROR', `Forbidden pattern: ${pattern.source}`);
      }
    }

    // Layer 2: DOMPurify sanitize
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: undefined, // use DOMPurify defaults
      ALLOWED_ATTR: this.ALLOWED_ATTRS,
      FORBID_TAGS: ['script', 'iframe', 'object'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick']
    });

    // Layer 3: sandbox wrapper - CSS isolation
    return `
      <div class="workcard-sandbox" style="isolation: isolate; all: initial; font-family:inherit;">
        ${clean}
      </div>
    `;
  }
}
