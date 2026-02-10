/**
 * Minimal studio types (expanded later when refactoring Studio workflow)
 */

export interface VisualDNA {
  id: string;
  name: string;
  description?: string;
  presets: Record<string, any>;
}

export interface ManuscriptIngestResult {
  title?: string;
  author?: string;
  rawText: string;
  html?: string;
  metadata?: Record<string, any>;
}
