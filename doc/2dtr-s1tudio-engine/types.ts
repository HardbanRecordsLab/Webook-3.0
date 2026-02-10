
export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  dna: 'classic' | 'modern' | 'minimalist' | 'industrial' | 'editorial';
  category: string;
}

export type AssetType = 'raster' | 'vector' | 'audio' | 'video' | 'source' | 'document';

export interface ChapterAsset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  mimeType: string;
  placement: 'chapter-start' | 'chapter-end' | 'contextual';
  source?: 'local' | 'unsplash' | 'ai';
}

export enum Step {
  MANUSCRIPT_INGEST = 'MANUSCRIPT_INGEST',
  DTP_ORCHESTRATION = 'DTP_ORCHESTRATION',
  ASSET_CONFIGURATION = 'ASSET_CONFIGURATION',
  PREFLIGHT_PROOFING = 'PREFLIGHT_PROOFING'
}

export interface BookContent {
  title: string;
  author: string;
  rawText: string;
  assets: ChapterAsset[];
}

export interface DTPPlan {
  structure: {
    chapters: {
      title: string;
      layoutType: string;
      assets: any[];
    }[];
  };
  typography: {
    bodyFont: string;
    colorPalette: {
      primary: string;
      accent: string;
    };
  };
}
