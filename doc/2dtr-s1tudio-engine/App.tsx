
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, Image as ImageIcon, Settings, Eye, Zap, 
  ChevronDown, ChevronRight, Upload, Plus, Trash2, 
  Printer, Layout, Type, Layers, Package, Music, Video, 
  Globe, CheckCircle2, Search, X, Menu, Save, HardDrive, Sparkles,
  FileCode, AlertCircle, Loader2, MousePointer2, QrCode, BrainCircuit,
  Database, ExternalLink, RefreshCw, Command, History, FolderPlus,
  Maximize2, Filter, Palette, LayoutGrid, Dna
} from 'lucide-react';
import * as mammoth from 'mammoth';
import { Step, BookContent, VisualTemplate, DTPPlan, ChapterAsset, AssetType } from './types';
import { PRESET_TEMPLATES, DEFAULT_CSS } from './constants';
import { analyzeBookContent } from './services/geminiService';
import { fetchBookMetadata } from './services/metadataService';
import { generateQRCodeUrl } from './services/qrService';
import { getSynonyms, getRelatedWords, SemanticResult } from './services/semanticService';
import { StepIndicator } from './components/StepIndicator';
import ModeSelector from './modes/assembly/ModeSelector';
import AssemblyWorkflow from './modes/assembly/AssemblyWorkflow';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.MANUSCRIPT_INGEST);
  const [content, setContent] = useState<BookContent>({ title: '', author: '', rawText: '', assets: [] });
  const [plan, setPlan] = useState<DTPPlan | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VisualTemplate>(PRESET_TEMPLATES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['assets', 'quick-tools']);
  
  // DNA Matrix State
  const [showDnaGallery, setShowDnaGallery] = useState(false);
  const [dnaFilter, setDnaFilter] = useState('All');
  const [dnaSearch, setDnaSearch] = useState('');
  
  // External APIs State
  const [searchQuery, setSearchQuery] = useState('');
  const [isbnQuery, setIsbnQuery] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [semanticWord, setSemanticWord] = useState('');
  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([]);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', ...new Set(PRESET_TEMPLATES.map(t => t.category))];
  
  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter(t => {
      const matchesFilter = dnaFilter === 'All' || t.category === dnaFilter;
      const matchesSearch = t.name.toLowerCase().includes(dnaSearch.toLowerCase()) || 
                            t.description.toLowerCase().includes(dnaSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [dnaFilter, dnaSearch]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleMetadataSearch = async () => {
    if (!isbnQuery) return;
    setIsMetadataLoading(true);
    const data = await fetchBookMetadata(isbnQuery);
    if (data) {
      setContent(prev => ({ ...prev, title: data.title, author: data.authors.join(', ') }));
      if (data.coverUrl) {
        const newAsset: ChapterAsset = {
          id: 'fetched-cover-' + Date.now(),
          name: `Cover: ${data.title}`,
          type: 'raster',
          url: data.coverUrl,
          mimeType: 'image/jpeg',
          placement: 'chapter-start',
          source: 'unsplash'
        };
        setContent(prev => ({ ...prev, assets: [newAsset, ...prev.assets] }));
      }
    }
    setIsMetadataLoading(false);
  };

  const handleQrGeneration = () => {
    if (!qrInput) return;
    const url = generateQRCodeUrl(qrInput);
    const newAsset: ChapterAsset = {
      id: 'qr-' + Date.now(),
      name: `QR: ${qrInput.substring(0, 15)}...`,
      type: 'raster',
      url: url,
      mimeType: 'image/png',
      placement: 'contextual',
      source: 'ai'
    };
    setContent(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
    setQrInput('');
  };

  const processManuscriptFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        setContent(prev => ({ ...prev, rawText: result.value }));
      } else if (['txt', 'md'].includes(ext!)) {
        const text = await file.text();
        setContent(prev => ({ ...prev, rawText: text }));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processManuscriptFile(file);
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    const files = Array.isArray(e) ? e : Array.from((e as React.ChangeEvent<HTMLInputElement>).target.files || []) as File[];
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const newAsset: ChapterAsset = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('image') ? 'raster' : 'source',
        url,
        mimeType: file.type,
        placement: 'contextual',
        source: 'local'
      };
      setContent(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
    });
  };

  const runOrchestration = async () => {
    if (!content.rawText) return;
    setIsProcessing(true);
    setStep(Step.DTP_ORCHESTRATION);
    try {
      const result = await analyzeBookContent(content.rawText);
      setPlan(result);
      setStep(Step.ASSET_CONFIGURATION);
    } catch (e) {
      setStep(Step.MANUSCRIPT_INGEST);
    } finally {
      setIsProcessing(false);
    }
  };

  const [mode, setMode] = useState<'select' | 'assembly' | 'studio'>('select');

  if (mode === 'select') {
    return <ModeSelector onSelect={(m) => setMode(m)} />;
  }

  if (mode === 'assembly') {
    return (
      <div className="min-h-screen bg-[#f3f4f6]">
        <div className="p-6 max-w-6xl mx-auto">
          <button onClick={() => setMode('select')} className="px-4 py-2 bg-slate-900 text-white rounded-lg mb-4">← Back to Mode Selector</button>
          <div className="bg-white rounded-2xl shadow p-6">
            <AssemblyWorkflow />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans select-none">
      <style dangerouslySetInnerHTML={{ __html: DEFAULT_CSS }} />
      
      {/* --- DNA VISUAL LAB OVERLAY --- */}
      {showDnaGallery && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-8 lg:p-16 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-full max-w-[1600px] h-full bg-slate-900 rounded-[4rem] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <header className="p-10 lg:p-16 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shrink-0">
                 <div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-6">
                      <Dna size={48} className="text-amber-500 animate-pulse" /> 
                      Visual DNA Matrix
                    </h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] mt-4 flex items-center gap-3">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      SYSTEM_BLUEPRINT_REPOSITORY // {PRESET_TEMPLATES.length} GENOTYPES_LOADED
                    </p>
                 </div>

                 <div className="flex flex-col items-end gap-6 w-full lg:w-auto">
                    <div className="flex gap-4 w-full lg:w-auto">
                       <div className="relative flex-1 lg:w-80">
                          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            className="w-full bg-slate-800 border-2 border-transparent focus:border-amber-500/30 rounded-2xl px-14 py-4 text-xs font-black uppercase text-white outline-none transition-all"
                            placeholder="Find layout genotype..."
                            value={dnaSearch}
                            onChange={(e) => setDnaSearch(e.target.value)}
                          />
                       </div>
                       <button onClick={() => setShowDnaGallery(false)} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-white transition-all">
                          <X size={32} />
                       </button>
                    </div>
                    <div className="flex flex-wrap bg-slate-800/50 p-1.5 rounded-2xl gap-1">
                       {categories.map(cat => (
                         <button 
                           key={cat} 
                           onClick={() => setDnaFilter(cat)}
                           className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${dnaFilter === cat ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                         >
                           {cat}
                           <span className="text-[8px] opacity-40">[{PRESET_TEMPLATES.filter(t => t.category === cat || cat === 'All').length}]</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto p-10 lg:p-16 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTemplates.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedTemplate(t); setShowDnaGallery(false); }}
                        className={`group relative p-10 rounded-[3rem] border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${selectedTemplate.id === t.id ? 'bg-amber-500 border-amber-500 shadow-[0_20px_40px_rgba(245,158,11,0.2)]' : 'bg-slate-800/30 border-white/5 hover:border-amber-500/40 hover:bg-slate-800/50'}`}
                      >
                         <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Dna size={200} />
                         </div>
                         
                         <div>
                            <div className="flex justify-between items-start mb-8">
                               <div className="w-20 h-20 rounded-[1.5rem] shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: t.previewColor }} />
                               <span className="text-[10px] font-black px-4 py-1.5 bg-black/30 rounded-full text-white/50 uppercase tracking-tighter">
                                 {t.dna.substring(0, 3)}-{t.id.split('-').pop()}
                               </span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-3 group-hover:translate-x-1 transition-transform">{t.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10 group-hover:text-slate-300 transition-colors">
                              {t.description}
                            </p>
                         </div>

                         <div className="flex justify-between items-center mt-auto">
                            <span className="text-[9px] font-black text-amber-500 group-hover:text-white uppercase tracking-widest">{t.category}</span>
                            <div className={`p-3 rounded-xl transition-all ${selectedTemplate.id === t.id ? 'bg-white text-amber-500' : 'bg-white/5 text-white opacity-0 group-hover:opacity-100'}`}>
                               <CheckCircle2 size={20} />
                            </div>
                         </div>
                      </div>
                    ))}
                    {filteredTemplates.length === 0 && (
                      <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-600 gap-6">
                         <Search size={80} className="opacity-10" />
                         <span className="text-xl font-black uppercase tracking-[0.4em]">Zero DNA patterns matched</span>
                      </div>
                    )}
                 </div>
              </div>
              
              <footer className="p-8 bg-black/20 border-t border-white/5 flex justify-center">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em]">DTR STUDIO DNA REPOSITORY // SELECT SEED TO INJECT BLUEPRINT</p>
              </footer>
           </div>
        </div>
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-24'} bg-[#0f172a] border-r border-slate-800 flex flex-col transition-all duration-500 z-50 no-print`}>
        <div className="p-8 flex items-center gap-4 border-b border-slate-800/50 mb-6 shrink-0">
          <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shrink-0">
            <Package size={24} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="font-black text-sm tracking-[0.2em] uppercase block leading-none text-white">DTR ENGINE</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 block">HARDBAN LABS</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {[
            { id: Step.MANUSCRIPT_INGEST, label: 'Manuscript Ingest', icon: FileText, desc: 'Import source' },
            { id: Step.ASSET_CONFIGURATION, label: 'Asset Workspace', icon: LayoutGrid, desc: 'DTP Canvas' },
            { id: Step.PREFLIGHT_PROOFING, label: 'Pre-flight Proof', icon: Eye, desc: 'Final render' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setStep(item.id)}
              className={`w-full flex items-center gap-5 px-5 py-5 rounded-2xl transition-all group ${
                step === item.id ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon size={22} />
              {sidebarOpen && (
                <div className="text-left">
                  <span className="text-[11px] font-black uppercase tracking-[0.1em] block">{item.label}</span>
                  <span className={`text-[8px] uppercase tracking-widest font-bold opacity-40 ${step === item.id ? 'text-amber-100' : ''}`}>{item.desc}</span>
                </div>
              )}
            </button>
          ))}
          
          {/* --- DNA WIDGET (SIDEBAR) --- */}
          {sidebarOpen && (
            <div className="mt-12 p-6 bg-slate-900/50 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                  <Dna size={80} />
               </div>
               <h4 className="text-[9px] font-black uppercase text-amber-500 mb-6 tracking-[0.3em] flex items-center gap-2">
                 <Sparkles size={12} /> Genotype Status
               </h4>
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl shadow-xl border border-white/10 shrink-0" style={{ backgroundColor: selectedTemplate.previewColor }} />
                  <div className="truncate">
                    <span className="text-[10px] font-black text-white uppercase block truncate">{selectedTemplate.name}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{selectedTemplate.dna} DNA</span>
                  </div>
               </div>
               <button 
                onClick={() => setShowDnaGallery(true)} 
                className="w-full py-4 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all border border-amber-500/20 tracking-widest"
              >
                  Reconfigure Matrix
               </button>
            </div>
          )}
        </nav>

        <div className="p-8 border-t border-slate-800/50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center text-slate-600 hover:text-white bg-slate-800/20 py-3 rounded-xl">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* --- WORKSPACE CANVAS --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#f8fafc] text-slate-900">
        
        <header className="h-24 bg-white border-b border-slate-200 flex justify-between items-center px-10 shrink-0 z-40 shadow-sm no-print">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Master Buffer:</span>
                <span className="text-sm font-black text-slate-900 tracking-tighter">{content.title || 'UNNAMED_SESSION'}</span>
              </div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 mt-1">DNA: {selectedTemplate.name}</div>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
             <StepIndicator currentStep={step} />
          </div>

          <div className="flex gap-4">
            <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/20 group">
              <Printer size={16} className="group-hover:rotate-12 transition-transform" /> Export Master PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[#f1f5f9]">
          
          {step === Step.MANUSCRIPT_INGEST && (
            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-10 animate-in fade-in duration-700">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-200/50">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 flex items-center gap-4">
                      <FileCode className="text-amber-500" size={32} /> Source Ingest
                    </h2>
                    <div className="flex gap-4">
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.md,.docx" />
                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-[1.5rem] font-black text-[11px] uppercase hover:bg-slate-200 border border-slate-200">
                        <Upload size={18} /> Load Manuscript
                      </button>
                    </div>
                  </div>
                  <textarea 
                    className="w-full h-[500px] bg-slate-50 border-2 border-transparent rounded-[3rem] p-12 text-lg font-medium leading-relaxed resize-none focus:bg-white focus:border-amber-500/20 transition-all outline-none"
                    placeholder="Wklej manuskrypt tutaj..."
                    value={content.rawText}
                    onChange={e => setContent({...content, rawText: e.target.value})}
                  />
                </div>
                <button 
                  onClick={runOrchestration} 
                  disabled={isProcessing}
                  className="w-full bg-slate-900 text-white py-12 rounded-[4rem] font-black uppercase tracking-[0.4em] text-2xl hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-8 group disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={32} /> Processing Genotypes...</>
                  ) : (
                    <>Run Engine Orchestration <ChevronRight size={36} className="group-hover:translate-x-3 transition-transform text-amber-500" /></>
                  )}
                </button>
              </div>

              <aside className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-[#0f172a] p-12 rounded-[3.5rem] shadow-2xl text-white border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Palette size={150} />
                   </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-10 flex items-center gap-3">
                    <Palette size={20} /> DNA Blueprint
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <button onClick={() => setShowDnaGallery(true)} className="w-full p-8 rounded-[2.5rem] bg-slate-800 border-2 border-amber-500/30 text-left hover:bg-slate-700 transition-all group">
                       <div className="w-14 h-14 rounded-2xl mb-6 shadow-2xl group-hover:scale-110 transition-transform" style={{ backgroundColor: selectedTemplate.previewColor }} />
                       <span className="text-xl font-black text-white uppercase block mb-1">{selectedTemplate.name}</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedTemplate.category} // {selectedTemplate.dna} DNA</span>
                    </button>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed text-center px-4 mt-6">
                      Kliknij powyżej, aby otworzyć pełną macierz <span className="text-amber-500">80+ genotypów</span> wizualnych HardbanRecords Lab.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                    <Database size={16} /> Metadata Search
                  </h3>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-slate-50 border-transparent rounded-xl px-4 py-3 text-xs font-bold" placeholder="ISBN..." value={isbnQuery} onChange={e => setIsbnQuery(e.target.value)} />
                    <button onClick={handleMetadataSearch} className="bg-amber-500 text-white p-3 rounded-xl"><RefreshCw size={16} /></button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {step === Step.DTP_ORCHESTRATION && (
            <div className="flex flex-col items-center justify-center h-full gap-12">
              <div className="relative">
                <div className="w-40 h-40 border-[16px] border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dna size={50} className="text-amber-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">Orchestrator Active</h2>
                <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.6em]">Crunching Layout Genotypes...</p>
              </div>
            </div>
          )}

          {step === Step.ASSET_CONFIGURATION && plan && (
            <div className="max-w-screen-2xl mx-auto grid grid-cols-12 gap-10 animate-in fade-in duration-700">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-200/50 min-h-[800px]">
                  <h2 className="text-3xl font-black text-slate-900 mb-16 flex items-center gap-5 uppercase tracking-tighter">
                    <Layout size={40} className="text-amber-500" /> Blueprint Workspace
                  </h2>

                  <div className="space-y-12">
                    {plan.structure.chapters.map((ch, idx) => (
                      <div key={idx} className="p-12 bg-slate-50/50 rounded-[3.5rem] border-2 border-transparent hover:border-amber-500/10 transition-all group relative">
                        <div className="flex justify-between items-center mb-10">
                          <div className="flex items-center gap-8">
                            <span className="w-16 h-16 bg-slate-900 text-amber-500 rounded-3xl flex items-center justify-center font-black text-xl shadow-xl">0{idx+1}</span>
                            <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter">{ch.title}</h3>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                           {content.assets.length === 0 ? (
                             <div className="col-span-3 py-20 border-4 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center opacity-30">
                               <span className="text-[12px] font-black uppercase tracking-[0.4em]">Register assets to map nodes</span>
                             </div>
                           ) : content.assets.map(a => (
                             <div key={a.id} className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-slate-200 group-hover:-translate-y-2 transition-all">
                               <img src={a.url} className="w-full h-full object-cover" />
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="col-span-12 lg:col-span-4 no-print h-full">
                <div className="bg-[#0f172a] rounded-[4rem] shadow-2xl p-10 border border-white/5 sticky top-32">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-12 flex items-center gap-4">
                    <Settings size={22} /> Property Dock
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-slate-800/30 rounded-3xl p-8 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest">Active Genotype</h4>
                        <div 
                          onClick={() => setShowDnaGallery(true)}
                          className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-center gap-4 cursor-pointer hover:bg-slate-800 transition-all"
                        >
                           <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: selectedTemplate.previewColor }} />
                           <div>
                              <span className="text-[11px] font-black text-white uppercase block">{selectedTemplate.name}</span>
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">DNA_ACTIVE</span>
                           </div>
                        </div>
                        <button onClick={() => setShowDnaGallery(true)} className="w-full mt-4 py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">
                           Open Visual DNA Matrix
                        </button>
                    </div>

                    <div className="bg-slate-800/30 rounded-3xl p-8 border border-white/5">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3 mb-6">
                        <HardDrive size={20} className="text-blue-500" /> Asset Registry
                      </h4>
                      <div className="space-y-4">
                           <input type="file" ref={assetInputRef} className="hidden" multiple onChange={handleAssetUpload} />
                           <button onClick={() => assetInputRef.current?.click()} className="w-full py-5 bg-slate-900/80 rounded-2xl text-[10px] font-black uppercase text-amber-500 border-2 border-dashed border-slate-700 tracking-[0.2em] hover:bg-slate-800 transition-all">
                              + Register Asset
                           </button>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {step === Step.PREFLIGHT_PROOFING && plan && (
             <div className="max-w-4xl mx-auto space-y-16 pb-40 animate-in zoom-in-95 duration-1000">
                <div className="bg-white p-24 shadow-2xl rounded-[5rem] border border-slate-100 relative" style={{
                  fontFamily: plan.typography.bodyFont,
                  '--accent': plan.typography.colorPalette.accent
                } as any}>
                  <div className="text-center mb-40 border-b-[24px] border-slate-900 pb-24">
                    <span className="text-[14px] font-black uppercase tracking-[1.2em] text-amber-500 block mb-12">PRODUCTION MASTER PROOF // {selectedTemplate.name}</span>
                    <h1 className="text-[100px] font-black uppercase leading-[0.8] tracking-tighter mb-12 text-slate-900">{content.title}</h1>
                    <p className="text-4xl font-bold tracking-[0.5em] text-slate-400 uppercase">{content.author}</p>
                  </div>
                  {plan.structure.chapters.map((ch, i) => (
                    <div key={i} className="mb-32">
                      <h2 className="text-6xl font-black uppercase mb-16 text-slate-900 border-l-[32px] border-amber-500 pl-20 py-4 tracking-tighter">
                        {ch.title}
                      </h2>
                      <div className="text-3xl leading-[1.6] text-slate-800 text-justify">
                         {content.rawText.substring(0, 1500)}...
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
