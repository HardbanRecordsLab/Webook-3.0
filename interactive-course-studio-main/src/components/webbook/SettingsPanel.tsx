import { X } from 'lucide-react';
import { Webbook } from '@/types/webbook';

interface SettingsPanelProps {
  webbook: Webbook;
  onUpdate: (webbook: Webbook) => void;
  onClose: () => void;
}

const SettingsPanel = ({ webbook, onUpdate, onClose }: SettingsPanelProps) => {
  const updateMeta = (key: string, value: string) => {
    onUpdate({ ...webbook, metadata: { ...webbook.metadata, [key]: value } });
  };

  const updateBranding = (key: string, value: string) => {
    onUpdate({ ...webbook, branding: { ...webbook.branding, [key]: value } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-serif font-bold text-foreground">Ustawienia Webbooka</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Metadane</h3>
            <div className="space-y-3">
              {[
                { key: 'title', label: 'Tytuł', placeholder: 'Nazwa webbooka' },
                { key: 'subtitle', label: 'Podtytuł', placeholder: 'Np. Program 21-dniowy' },
                { key: 'author', label: 'Autor', placeholder: 'Imię i nazwisko' },
                { key: 'description', label: 'Opis', placeholder: 'Krótki opis kursu' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-muted-foreground mb-1">{label}</label>
                  <input
                    value={(webbook.metadata as any)[key]}
                    onChange={(e) => updateMeta(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Branding</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'primaryColor', label: 'Główny' },
                { key: 'secondaryColor', label: 'Drugi' },
                { key: 'accentColor', label: 'Akcent' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm text-muted-foreground mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(webbook.branding as any)[key]}
                      onChange={(e) => updateBranding(key, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      value={(webbook.branding as any)[key]}
                      onChange={(e) => updateBranding(key, e.target.value)}
                      className="flex-1 p-1.5 rounded border border-input bg-background text-foreground text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
