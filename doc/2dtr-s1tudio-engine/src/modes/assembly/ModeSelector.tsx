import React from 'react';
import { Command, Palette } from 'lucide-react';

interface ModeSelectorProps {
  onSelect: (mode: 'assembly' | 'studio') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <div className="max-w-7xl mx-auto px-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white mb-4">DTR Studio Engine</h1>
          <p className="text-slate-500 text-sm uppercase tracking-[0.4em]">Choose Your Workflow</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <button
            onClick={() => onSelect('assembly')}
            className="group p-10 bg-slate-900 rounded-[3rem] border-2 border-white/5 hover:border-amber-500/50 transition-all text-left"
          >
            <Command size={64} className="text-amber-500 mb-6" />
            <h2 className="text-2xl font-black uppercase text-white mb-3">Assembly Mode</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Manifest-driven ebook assembly. Perfect for workbooks, courses, and interactive publications.
            </p>
            <div className="flex gap-3 text-xs text-slate-600 uppercase tracking-widest">
              <span className="px-3 py-2 bg-slate-800 rounded-xl">Zero AI Content</span>
              <span className="px-3 py-2 bg-slate-800 rounded-xl">Deterministic</span>
            </div>
          </button>

          <button
            onClick={() => onSelect('studio')}
            className="group p-10 bg-slate-900 rounded-[3rem] border-2 border-white/5 hover:border-amber-500/50 transition-all text-left"
          >
            <Palette size={64} className="text-amber-500 mb-6" />
            <h2 className="text-2xl font-black uppercase text-white mb-3">Studio Mode</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AI-powered layout orchestration. Perfect for novels, portfolios, and print-ready publications.
            </p>
            <div className="flex gap-3 text-xs text-slate-600 uppercase tracking-widest">
              <span className="px-3 py-2 bg-slate-800 rounded-xl">Visual DNA</span>
              <span className="px-3 py-2 bg-slate-800 rounded-xl">Typography AI</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
