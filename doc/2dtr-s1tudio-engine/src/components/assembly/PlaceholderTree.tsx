import React from 'react';
import type { PlaceholderMapping } from '../../types/assembly.types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PlaceholderTreeProps {
  placeholders: PlaceholderMapping[];
  mappings: Map<string, any>;
  onSelect: (name: string) => void;
  filter?: string;
}

const PlaceholderTree: React.FC<PlaceholderTreeProps> = ({ placeholders, mappings, onSelect, filter }) => {
  const grouped = placeholders.reduce<Record<string, PlaceholderMapping[]>>((acc, ph) => {
    acc[ph.sectionId] = acc[ph.sectionId] || [];
    acc[ph.sectionId].push(ph);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([section, phs]) => (
        <div key={section}>
          <h4 className="font-black text-sm mb-3">{section}</h4>
          <div className="space-y-2">
            {phs.filter(p => !filter || p.name.includes(filter)).map(p => {
              const mapped = mappings.get(p.name);
              return (
                <div key={p.name} className={`p-3 rounded-lg flex items-center justify-between ${mapped ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div>
                    <code className="font-black">{p.name}</code>
                    <div className="text-xs text-slate-500">{p.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mapped ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-500" />}
                    <button onClick={() => onSelect(p.name)} className="px-3 py-1 rounded bg-white text-xs border">Map</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaceholderTree;
