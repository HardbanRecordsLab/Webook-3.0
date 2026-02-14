import { Book, Plus, Layout, Sparkles } from 'lucide-react';
import { TEMPLATES, createWebbook, Webbook } from '@/types/webbook';

interface StartScreenProps {
  onStart: (webbook: Webbook) => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Hero */}
      <div className="text-center mb-16 max-w-2xl">
        <div className="flex justify-center mb-8">
           <img src="/logo.png" alt="Webook 3.0 Studio" className="h-32 w-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Webbook 3.0 Creator</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4 tracking-tight">
          Twórz Interaktywne Kursy
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Profesjonalne webbooki z lekcjami, kartami pracy, quizami i multimediami.
          Eksportuj jako gotowy plik HTML.
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-16">
        <button
          onClick={() => onStart(createWebbook())}
          className="group relative flex flex-col items-center gap-4 p-8 rounded-xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-1">Utwórz Nowy</h3>
            <p className="text-sm text-muted-foreground">Zacznij od zera z pustym projektem</p>
          </div>
        </button>

        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target?.result as string);
                    onStart(data);
                  } catch { /* ignore */ }
                };
                reader.readAsText(file);
              }
            };
            input.click();
          }}
          className="group relative flex flex-col items-center gap-4 p-8 rounded-xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Layout className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-1">Importuj Projekt</h3>
            <p className="text-sm text-muted-foreground">Wczytaj zapisany plik .json</p>
          </div>
        </button>
      </div>

      {/* Templates */}
      <div className="max-w-4xl w-full">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">Szablony</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              onClick={() => onStart(tpl.create())}
              className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all text-left hover:shadow-md"
            >
              <span className="text-3xl">{tpl.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{tpl.name}</h3>
                <p className="text-sm text-muted-foreground">{tpl.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-muted-foreground">
        <p>Webbook 3.0 Studio · HardbanRecords Lab</p>
      </div>
    </div>
  );
};

export default StartScreen;
