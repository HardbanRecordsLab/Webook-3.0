/**
 * Types used across Assembly Mode
 * - Fully typed and strict by design
 */

export type AssetType =
  | 'workcard-html'
  | 'raster'
  | 'vector'
  | 'audio'
  | 'font'
  | 'other';

export interface ManifestMetadata {
  title: string;
  author?: string;
  language?: string;
  version?: string;
}

export interface ManifestSection {
  id: string;
  title: string;
  order?: number;
  // placeholders are strings like "{{COVER_IMAGE}}" or "{{INTRO_HTML}}"
  placeholders: string[];
}

export interface AssemblyManifest {
  metadata: ManifestMetadata;
  sections: ManifestSection[];
  assets?: {
    css?: string[];
    scripts?: string[];
  };
}

export interface PlaceholderMapping {
  name: string; // e.g. "{{COVER_IMAGE}}"
  sectionId: string;
  type: AssetType;
  required?: boolean;
  resolved?: boolean;
  mappedPath?: string; // path inside uploaded assets
}

export interface ProcessingConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

export interface ProcessedAsset {
  id: string;
  originalName: string;
  type: AssetType;
  blob: Blob;
  url: string; // object URL for preview
  checksum: string; // sha-256 hex
  size: number;
  meta?: {
    width?: number;
    height?: number;
    duration?: number;
    mime?: string;
  };
}

export interface ValidationError {
  code: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
  path?: string;
}
