// ═══════════════════════════════════════════════════════════
// WEBOOK STUDIO 4.0 — Block Types & Utilities
// ═══════════════════════════════════════════════════════════

export type BlockType =
  // TEKST
  | 'h1' | 'h2' | 'h3' | 'paragraph' | 'quote' | 'callout' | 'note' | 'codeblock'
  // MEDIA
  | 'image' | 'video' | 'audio' | 'embed' | 'file'
  // LAYOUT
  | 'divider' | 'spacer' | 'columns2' | 'columns3'
  // INTERAKTYWNE
  | 'quiz' | 'poll' | 'checklist' | 'flashcards' | 'sortable' | 'matching'
  // NARZĘDZIA AI
  | 'interactive_tool'
  // MINI APPS & AUDIO
  | 'mini_app'
  | 'audio_narrator'
  // WIZUALNE
  | 'table' | 'toggle' | 'timeline' | 'steps' | 'keyterm' | 'highlight_box'
  | 'progress_bar' | 'rating' | 'countdown' | 'stats_card' | 'comparison'

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface Block {
  id: string
  type: BlockType
  content: string
  props?: Record<string, unknown>
}

export interface Chapter {
  id: string
  title: string
  emoji: string
  blocks: Block[]
  isLocked?: boolean
}

export interface WebookMeta {
  title: string
  description: string
  coverEmoji: string
  coverGradient: string
  theme: 'dark' | 'light' | 'sepia'
  font: 'default' | 'serif' | 'mono'
  accentColor: string
  author: string
  language: string
  tags: string[]
}

export const uid = () => Math.random().toString(36).slice(2, 9)

// Block display metadata
export const BLOCK_META: Record<BlockType, { icon: string; label: string; group: string; color: string; shortcut?: string }> = {
  h1:               { icon: 'H1', label: 'Nagłówek 1',       group: 'Tekst',        color: '#60a5fa', shortcut: '/h1' },
  h2:               { icon: 'H2', label: 'Nagłówek 2',       group: 'Tekst',        color: '#818cf8', shortcut: '/h2' },
  h3:               { icon: 'H3', label: 'Nagłówek 3',       group: 'Tekst',        color: '#a78bfa', shortcut: '/h3' },
  paragraph:        { icon: '¶',  label: 'Akapit',           group: 'Tekst',        color: '#94a3b8', shortcut: '/p' },
  quote:            { icon: '"',  label: 'Cytat',            group: 'Tekst',        color: '#34d399', shortcut: '/q' },
  callout:          { icon: '💡', label: 'Callout',          group: 'Tekst',        color: '#fbbf24', shortcut: '/call' },
  note:             { icon: '📌', label: 'Notatka',          group: 'Tekst',        color: '#f97316', shortcut: '/note' },
  codeblock:        { icon: '<>', label: 'Kod',              group: 'Tekst',        color: '#6ee7b7', shortcut: '/code' },
  image:            { icon: '🖼', label: 'Obraz',            group: 'Media',        color: '#c084fc', shortcut: '/img' },
  video:            { icon: '▶', label: 'Wideo',             group: 'Media',        color: '#f87171', shortcut: '/vid' },
  audio:            { icon: '🎙', label: 'Audio',            group: 'Media',        color: '#fb923c', shortcut: '/aud' },
  embed:            { icon: '🔗', label: 'Embed',            group: 'Media',        color: '#38bdf8', shortcut: '/emb' },
  file:             { icon: '📎', label: 'Plik',             group: 'Media',        color: '#94a3b8', shortcut: '/file' },
  divider:          { icon: '—',  label: 'Separator',        group: 'Layout',       color: '#4b5563' },
  spacer:           { icon: '↕',  label: 'Odstęp',           group: 'Layout',       color: '#374151' },
  columns2:         { icon: '⊞',  label: '2 Kolumny',        group: 'Layout',       color: '#7c3aed', shortcut: '/col' },
  columns3:         { icon: '⊟',  label: '3 Kolumny',        group: 'Layout',       color: '#6d28d9' },
  quiz:             { icon: '❓', label: 'Quiz',             group: 'Interaktywne', color: '#f59e0b', shortcut: '/quiz' },
  poll:             { icon: '📊', label: 'Ankieta',          group: 'Interaktywne', color: '#10b981', shortcut: '/poll' },
  checklist:        { icon: '✅', label: 'Checklista',       group: 'Interaktywne', color: '#34d399', shortcut: '/check' },
  flashcards:       { icon: '🃏', label: 'Fiszki',           group: 'Interaktywne', color: '#818cf8', shortcut: '/flash' },
  sortable:         { icon: '🔀', label: 'Sortowanie',       group: 'Interaktywne', color: '#f97316', shortcut: '/sort' },
  matching:         { icon: '🔗', label: 'Dopasowanie',      group: 'Interaktywne', color: '#06b6d4', shortcut: '/match' },
  interactive_tool: { icon: '⚡', label: 'Narzędzie AI',     group: 'Interaktywne', color: '#fbbf24', shortcut: '/tool' },
  mini_app:         { icon: '📱', label: 'Mini App',          group: 'Interaktywne', color: '#a78bfa', shortcut: '/app' },
  audio_narrator:   { icon: '🔊', label: 'Odsłuch',           group: 'Media',        color: '#f97316', shortcut: '/audio' },
  table:            { icon: '⊞',  label: 'Tabela',           group: 'Wizualne',     color: '#60a5fa', shortcut: '/table' },
  toggle:           { icon: '▶',  label: 'Toggle',           group: 'Wizualne',     color: '#a78bfa', shortcut: '/tog' },
  timeline:         { icon: '📅', label: 'Oś czasu',         group: 'Wizualne',     color: '#34d399', shortcut: '/time' },
  steps:            { icon: '1️⃣', label: 'Kroki',            group: 'Wizualne',     color: '#38bdf8', shortcut: '/steps' },
  keyterm:          { icon: '🔑', label: 'Słowo kluczowe',   group: 'Wizualne',     color: '#fbbf24', shortcut: '/key' },
  highlight_box:    { icon: '🎨', label: 'Wyróżnienie',      group: 'Wizualne',     color: '#f472b6', shortcut: '/hl' },
  progress_bar:     { icon: '📈', label: 'Pasek postępu',    group: 'Wizualne',     color: '#10b981', shortcut: '/prog' },
  rating:           { icon: '⭐', label: 'Ocena',            group: 'Wizualne',     color: '#f59e0b', shortcut: '/rate' },
  countdown:        { icon: '⏱', label: 'Odliczanie',       group: 'Wizualne',     color: '#f43f5e', shortcut: '/count' },
  stats_card:       { icon: '📊', label: 'Karta statystyk',  group: 'Wizualne',     color: '#8b5cf6', shortcut: '/stat' },
  comparison:       { icon: '⚖', label: 'Porównanie',       group: 'Wizualne',     color: '#06b6d4', shortcut: '/comp' },
}

// Groups for the block picker
export const BLOCK_GROUPS = ['Tekst', 'Media', 'Layout', 'Interaktywne', 'Wizualne']

// Create a default block
export function createBlock(type: BlockType): Block {
  const b: Block = { id: uid(), type, content: '' }
  switch (type) {
    case 'quiz':
      b.content = 'Pytanie quizowe?'
      b.props = {
        options: [
          { id: uid(), text: 'Opcja A', isCorrect: true, explanation: '' },
          { id: uid(), text: 'Opcja B', isCorrect: false, explanation: '' },
          { id: uid(), text: 'Opcja C', isCorrect: false, explanation: '' },
          { id: uid(), text: 'Opcja D', isCorrect: false, explanation: '' },
        ] as QuizOption[],
        feedback: { correct: '✅ Świetnie!', incorrect: '❌ Spróbuj ponownie.' },
        points: 1,
      }
      break
    case 'poll':
      b.content = 'Twoje pytanie?'
      b.props = { options: ['Opcja 1', 'Opcja 2', 'Opcja 3'], votes: [0, 0, 0] }
      break
    case 'checklist':
      b.props = { items: [{ id: uid(), text: 'Krok 1', done: false }, { id: uid(), text: 'Krok 2', done: false }] }
      break
    case 'flashcards':
      b.props = { cards: [{ id: uid(), front: 'Pytanie?', back: 'Odpowiedź' }, { id: uid(), front: 'Pytanie 2?', back: 'Odpowiedź 2' }] }
      break
    case 'sortable':
      b.content = 'Ułóż elementy w odpowiedniej kolejności:'
      b.props = { items: [{ id: uid(), text: 'Element 1', order: 0 }, { id: uid(), text: 'Element 2', order: 1 }, { id: uid(), text: 'Element 3', order: 2 }] }
      break
    case 'matching':
      b.content = 'Dopasuj pary:'
      b.props = { pairs: [{ id: uid(), left: 'Pojęcie A', right: 'Definicja A' }, { id: uid(), left: 'Pojęcie B', right: 'Definicja B' }] }
      break
    case 'table':
      b.props = {
        headers: ['Kolumna 1', 'Kolumna 2', 'Kolumna 3'],
        rows: [['', '', ''], ['', '', '']]
      }
      break
    case 'toggle':
      b.content = 'Kliknij by rozwinąć...'
      b.props = { body: 'Ukryta treść toggle bloku.' }
      break
    case 'timeline':
      b.props = { events: [{ id: uid(), date: '2024', title: 'Zdarzenie 1', desc: '' }, { id: uid(), date: '2025', title: 'Zdarzenie 2', desc: '' }] }
      break
    case 'steps':
      b.props = { steps: [{ id: uid(), title: 'Krok 1', desc: 'Opis kroku 1' }, { id: uid(), title: 'Krok 2', desc: 'Opis kroku 2' }] }
      break
    case 'keyterm':
      b.content = 'Termin'
      b.props = { definition: 'Definicja tego terminu...' }
      break
    case 'highlight_box':
      b.content = 'Ważna informacja do zapamiętania'
      b.props = { color: 'blue', icon: '💡' }
      break
    case 'progress_bar':
      b.content = 'Postęp kursu'
      b.props = { value: 65, max: 100, showLabel: true, color: 'blue' }
      break
    case 'rating':
      b.content = 'Oceń ten materiał'
      b.props = { max: 5, value: 0, type: 'stars' }
      break
    case 'countdown':
      b.content = 'Do egzaminu zostało'
      b.props = { targetDate: '', label: 'dni' }
      break
    case 'stats_card':
      b.props = { stats: [{ id: uid(), value: '95%', label: 'Zdawalność' }, { id: uid(), value: '2h', label: 'Czas nauki' }, { id: uid(), value: '4.9★', label: 'Ocena' }] }
      break
    case 'comparison':
      b.props = {
        left: { title: 'Opcja A', color: 'blue', items: ['Zaleta 1', 'Zaleta 2'] },
        right: { title: 'Opcja B', color: 'orange', items: ['Zaleta 1', 'Zaleta 2'] }
      }
      break
    case 'columns2':
      b.props = { col1: '', col2: '' }
      break
    case 'columns3':
      b.props = { col1: '', col2: '', col3: '' }
      break
    case 'callout':
      b.props = { icon: '💡', color: 'amber' }
      break
    case 'note':
      b.props = { icon: '📌', color: 'blue' }
      break
    case 'codeblock':
      b.props = { language: 'javascript' }
      break
    case 'spacer':
      b.props = { height: 40 }
      break
  }
  return b
}
