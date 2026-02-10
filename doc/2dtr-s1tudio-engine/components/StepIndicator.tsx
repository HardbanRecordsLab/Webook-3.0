
import React from 'react';
import { Step } from '../types';
import { Type, Sparkles, Layout, BookOpen } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps = [
  // Fixed: Map steps to the correct Step enum values from types.ts to resolve property access errors
  { id: Step.MANUSCRIPT_INGEST, label: '1. Twój Tekst', icon: Type },
  { id: Step.DTP_ORCHESTRATION, label: '2. Praca AI', icon: Sparkles },
  { id: Step.ASSET_CONFIGURATION, label: '3. Twój Projekt', icon: Layout },
  { id: Step.PREFLIGHT_PROOFING, label: '4. Gotowe', icon: BookOpen },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-16 max-w-5xl mx-auto px-6 no-print">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isPast = steps.findIndex(s => s.id === currentStep) > idx;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-4">
              <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center border-[3px] transition-all duration-500 ${
                isActive ? 'bg-amber-600 border-amber-600 text-white shadow-xl shadow-amber-600/20 scale-110' : 
                isPast ? 'bg-slate-900 border-slate-900 text-amber-500' : 
                'bg-white border-slate-100 text-slate-300'
              }`}>
                <Icon size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-slate-800' : 'text-slate-300'}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-700 ${isPast ? 'bg-slate-900' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
