import { Eye, Download, Save, ArrowLeft, FileJson } from 'lucide-react';
import { Webbook } from '@/types/webbook';
import { exportWebbookToHtml } from '@/utils/exportHtml';

interface BuilderHeaderProps {
  webbook: Webbook;
  onPreview: () => void;
  onBack: () => void;
}

const BuilderHeader = ({ webbook, onPreview, onBack }: BuilderHeaderProps) => {
  const handleExportHtml = () => {
    const html = exportWebbookToHtml(webbook);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${webbook.metadata.title || 'webbook'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const json = JSON.stringify(webbook, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${webbook.metadata.title || 'webbook'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <img src="/logo.png" alt="Webook 3.0 Studio" className="h-8 w-auto mr-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </button>
        <div className="w-px h-5 bg-border" />
        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
          {webbook.metadata.title || 'Nowy Webbook'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <FileJson className="w-4 h-4" />
          Zapisz JSON
        </button>
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Eye className="w-4 h-4" />
          Podgląd
        </button>
        <button
          onClick={handleExportHtml}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Eksport HTML
        </button>
      </div>
    </header>
  );
};

export default BuilderHeader;
