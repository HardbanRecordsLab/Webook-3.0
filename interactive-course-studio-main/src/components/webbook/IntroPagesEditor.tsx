import { useState } from 'react';
import { IntroPages } from '@/types/webbook';
import { Sparkles, Loader2, BookOpen, Shield, AlertTriangle, Users, HelpCircle } from 'lucide-react';
import { generateIntroPages } from '@/services/aiService';
import { toast } from 'sonner';

interface IntroPagesEditorProps {
  introPages: IntroPages;
  onUpdate: (pages: IntroPages) => void;
  courseTopic?: string;
}

const IntroPagesEditor = ({ introPages, onUpdate, courseTopic }: IntroPagesEditorProps) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof IntroPages>('aboutAuthor');

  const handleGenerateAll = async () => {
    if (!courseTopic) {
      toast.error('Najpierw ustaw tytuł webbooka w ustawieniach');
      return;
    }
    setAiLoading(true);
    try {
      const pages = await generateIntroPages(courseTopic);
      onUpdate({
        aboutAuthor: pages.aboutAuthor || introPages.aboutAuthor,
        copyright: pages.copyright || introPages.copyright,
        disclaimer: pages.disclaimer || introPages.disclaimer,
        forWhom: pages.forWhom || introPages.forWhom,
        howToUse: pages.howToUse || introPages.howToUse,
      });
      toast.success('Strony wstępne wygenerowane!');
    } catch (e: any) {
      toast.error(e.message || 'Błąd generowania');
    } finally {
      setAiLoading(false);
    }
  };

  const sections: { key: keyof IntroPages; label: string; icon: typeof BookOpen; placeholder: string }[] = [
    { key: 'aboutAuthor', label: 'O Autorze', icon: BookOpen, placeholder: 'Opisz autora kursu, jego doświadczenie i kwalifikacje...' },
    { key: 'copyright', label: 'Prawa Autorskie', icon: Shield, placeholder: 'Informacje o prawach autorskich i licencji...' },
    { key: 'disclaimer', label: 'Zastrzeżenia', icon: AlertTriangle, placeholder: 'Zastrzeżenia prawne, ograniczenie odpowiedzialności...' },
    { key: 'forWhom', label: 'Dla Kogo', icon: Users, placeholder: 'Dla kogo jest ten kurs? Jakie kryteria spełnia idealny uczestnik?' },
    { key: 'howToUse', label: 'Jak Korzystać', icon: HelpCircle, placeholder: 'Instrukcja korzystania z webbooka, harmonogram, wskazówki...' },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Strony Wstępne</h2>
          <p className="text-sm text-muted-foreground">Informacje o autorze, prawach autorskich, zastrzeżeniach</p>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generuj AI wszystkie
        </button>
      </div>

      <div className="flex">
        {/* Section tabs */}
        <div className="w-48 border-r border-border p-2 space-y-1">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                activeSection === key ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          {sections.map(
            ({ key, label, placeholder }) =>
              activeSection === key && (
                <div key={key}>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
                  <textarea
                    value={introPages[key]}
                    onChange={(e) => onUpdate({ ...introPages, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full min-h-[350px] p-4 rounded-lg border border-input bg-card text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/40 text-sm leading-relaxed"
                  />
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroPagesEditor;
