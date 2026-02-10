/**
 * Shared types across the app
 */

import type { ProcessedAsset } from './assembly.types';

export type ExportFormat = 'html' | 'pdf' | 'epub' | 'mobi';

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  size: number;
  downloadURL?: string;
  metadata?: Record<string, any>;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  manifest?: any;
  mappings?: [string, ProcessedAsset][];
  notes?: string;
}
