export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  provider?: string;
  duration?: number;
  prompt?: string;
}

export interface WorksheetQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea';
}

export interface Worksheet {
  title: string;
  questions: WorksheetQuestion[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  multimedia: {
    images?: MediaFile[];
    audio?: MediaFile;
    video?: string;
  };
  worksheet?: Worksheet;
  quiz?: Quiz;
  learningObjectives?: string[];
  glossaryTerms?: {
    id: string;
    term: string;
    definition: string;
  }[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface WebbookBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
}

export interface WebbookMetadata {
  title: string;
  subtitle: string;
  author: string;
  description: string;
  language: string;
}

export interface IntroPages {
  aboutAuthor: string;
  copyright: string;
  disclaimer: string;
  forWhom: string;
  howToUse: string;
}

export interface Webbook {
  metadata: WebbookMetadata;
  modules: Module[];
  branding: WebbookBranding;
  introPages?: IntroPages;
}

export type AppView = 'start' | 'builder' | 'preview';

export const createId = () => Math.random().toString(36).slice(2, 10);

export const createLesson = (title = 'Nowa Lekcja'): Lesson => ({
  id: createId(),
  title,
  subtitle: '',
  content: '',
  multimedia: {},
});

export const createModule = (title = 'Nowy Moduł'): Module => ({
  id: createId(),
  title,
  description: '',
  lessons: [createLesson('Lekcja 1')],
});

export const createWebbook = (): Webbook => ({
  metadata: {
    title: '',
    subtitle: '',
    author: '',
    description: '',
    language: 'pl',
  },
  modules: [],
  branding: {
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
  },
  introPages: {
    aboutAuthor: '',
    copyright: '',
    disclaimer: '',
    forWhom: '',
    howToUse: '',
  },
});

export const TEMPLATES: { name: string; description: string; icon: string; create: () => Webbook }[] = [
  {
    name: '7-Dniowy Kurs',
    description: 'Kurs tygodniowy z codziennymi lekcjami',
    icon: '📅',
    create: () => ({
      ...createWebbook(),
      metadata: { title: 'Tydzień Transformacji', subtitle: '7 dni intensywnej nauki', author: '', description: '', language: 'pl' },
      modules: [
        { id: createId(), title: 'Tydzień 1', description: 'Codzienne lekcje', lessons: Array.from({ length: 7 }, (_, i) => createLesson(`Dzień ${i + 1}`)) },
      ],
    }),
  },
  {
    name: '21-Dniowy Program',
    description: 'Rozbudowany program 3-tygodniowy',
    icon: '🗓️',
    create: () => ({
      ...createWebbook(),
      metadata: { title: 'Program 21 Dni', subtitle: 'Kompleksowa transformacja', author: '', description: '', language: 'pl' },
      modules: Array.from({ length: 3 }, (_, w) => ({
        id: createId(), title: `Tydzień ${w + 1}`, description: '', lessons: Array.from({ length: 7 }, (_, d) => createLesson(`Dzień ${w * 7 + d + 1}`)),
      })),
    }),
  },
  {
    name: 'Kurs Modułowy',
    description: 'Kurs z 4 modułami tematycznymi',
    icon: '📚',
    create: () => ({
      ...createWebbook(),
      metadata: { title: 'Kurs Modułowy', subtitle: 'Nauka krok po kroku', author: '', description: '', language: 'pl' },
      modules: Array.from({ length: 4 }, (_, i) => ({
        id: createId(), title: `Moduł ${i + 1}: Temat`, description: '', lessons: Array.from({ length: 3 }, (_, j) => createLesson(`Lekcja ${j + 1}`)),
      })),
    }),
  },
];
