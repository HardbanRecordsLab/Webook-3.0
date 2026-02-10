
import { VisualTemplate } from './types';

export const DTP_LAYOUT_SPECS = {
  'EDITORIAL_CLASSIC': 'Standard editorial layout for long-form narrative.',
  'MAGAZINE_GRID': 'Modular grid system for visual-heavy publications.',
  'ACADEMIC_SPLIT': 'Two-column layout optimized for scholarly citations.',
  'MINIMAL_BRUTALIST': 'High-contrast, raw typography focus.',
  'INDUSTRIAL_MONO': 'Technical documentation style using monospaced font-metrics.'
};

export const PRESET_TEMPLATES: VisualTemplate[] = [
  { id: 'dtp-v1', name: 'Elite Renaissance', category: 'Classic Editorial', description: 'Timeless luxury with deep-serif typography.', previewColor: '#fdfbf7', dna: 'classic' },
  { id: 'dtp-v2', name: 'Technical Brutalism', category: 'Industrial', description: 'Raw, engineering-focused documentation style.', previewColor: '#000000', dna: 'industrial' },
  { id: 'dtp-v3', name: 'Vanguard Modern', category: 'Minimalist', description: 'Ultra-clean Swiss design principles.', previewColor: '#ffffff', dna: 'minimalist' },
  { id: 'dtp-v4', name: 'Cyberpunk Redux', category: 'Conceptual', description: 'Neon accents and high-density information layout.', previewColor: '#0f172a', dna: 'modern' },
  { id: 'dtp-v5', name: 'Academic Standard', category: 'Educational', description: 'Structured for citations and structured data.', previewColor: '#f1f5f9', dna: 'editorial' },
  ...Array.from({ length: 75 }).map((_, i) => ({
    id: `variant-${i}`,
    name: `Studio Spec ${i + 1}`,
    category: 'Advanced Collections',
    description: 'Specialized layout variation for specific industry needs.',
    previewColor: i % 2 === 0 ? '#111' : '#eee',
    dna: 'modern' as const
  }))
];

export const SYSTEM_PROMPT = `You are a Senior DTP Orchestration Engine. 
Analyze the manuscript and output a JSON Publication Blueprint. 
Standard industry layouts only: 'editorial-classic', 'magazine-grid', 'academic-split'. 
Be precise with typographic hierarchy.`;

export const DEFAULT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;700;800;900&display=swap');

:root {
  --studio-gold: #f59e0b;
  --studio-dark: #020617;
  --studio-slate: #64748b;
  --dtp-body-font: 'Crimson Pro', serif;
  --dtp-heading-font: 'Inter', sans-serif;
}

body { font-family: var(--dtp-heading-font); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.2); border-radius: 10px; }

.manuscript-content {
  counter-reset: page;
  color: #1e293b;
}

@media print {
  @page { margin: 1.5cm; }
  body { background: white !important; }
  .no-print { display: none !important; }
}
`;
