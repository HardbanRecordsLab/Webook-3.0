import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Save, Eye, Download, Trash2, GripVertical, FileText, Settings, Upload, Loader2, BookOpen, Clock, Moon, Sun, Bold, Italic, List, Link, Heading1, CreditCard, Check, Lock, Sparkles, Image, Wallet, Building } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getProject, updateProject, getChapters, createChapter, updateChapter, deleteChapter, uploadPDF, exportWebbook, createCheckout, getPaymentMethods } from '../lib/api';

export default function Builder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newChapterOpen, setNewChapterOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [projectRes, chaptersRes, methodsRes] = await Promise.all([
        getProject(projectId),
        getChapters(projectId),
        getPaymentMethods().catch(() => ({ data: { methods: [], default_method: 'stripe' } }))
      ]);
      setProject(projectRes.data);
      setChapters(chaptersRes.data);
      if (chaptersRes.data.length > 0) setSelectedChapter(chaptersRes.data[0]);
      if (methodsRes.data?.methods) {
        setPaymentMethods(methodsRes.data.methods);
        setSelectedPaymentMethod(methodsRes.data.default_method || 'stripe');
      }
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const isPaid = true; // FREE VERSION: Always unlocked

  const handleSaveChapter = async () => {
    if (!selectedChapter) return;
    setSaving(true);
    try {
      await updateChapter(selectedChapter.id, { title: selectedChapter.title, content: selectedChapter.content });
      toast.success('Saved!');
      setChapters(chapters.map(c => c.id === selectedChapter.id ? selectedChapter : c));
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) { toast.error('Enter title'); return; }
    try {
      const res = await createChapter(projectId, { title: newChapterTitle, content: '<p>Start writing...</p>', order: chapters.length });
      setChapters([...chapters, res.data]);
      setSelectedChapter(res.data);
      setNewChapterOpen(false);
      setNewChapterTitle('');
      toast.success('Chapter created!');
    } catch (error) {
      toast.error('Failed to create chapter');
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      await deleteChapter(chapterId);
      const newChapters = chapters.filter(c => c.id !== chapterId);
      setChapters(newChapters);
      if (selectedChapter?.id === chapterId) setSelectedChapter(newChapters[0] || null);
      toast.success('Deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Importing PDF...');
      const res = await uploadPDF(projectId, file);
      toast.dismiss();
      toast.success(`Imported ${res.data.chapters} chapters!`);
      loadData();
    } catch (error) {
      toast.dismiss();
      toast.error('Import failed');
    }
  };

  const handleExport = async () => {
    if (!isPaid) { setCheckoutOpen(true); return; }
    try {
      const res = await exportWebbook(projectId);
      const blob = new Blob([res.data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported!');
    } catch (error) {
      if (error.response?.status === 402) setCheckoutOpen(true);
      else toast.error('Export failed');
    }
  };

  const handleCheckout = async () => {
    setProcessingPayment(true);
    try {
      const res = await createCheckout(projectId, selectedPaymentMethod);
      window.location.href = res.data.url;
    } catch (error) {
      if (error.response?.status === 503) {
        toast.error(error.response.data?.detail || 'This payment method is not configured yet');
      } else {
        toast.error('Payment error');
      }
      setProcessingPayment(false);
    }
  };

  const getPaymentMethodIcon = (methodId) => {
    switch (methodId) {
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'paypal': return <Wallet className="w-5 h-5" />;
      case 'przelewy24': return <Building className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateProject(projectId, { title: project.title, description: project.description, settings: project.settings });
      toast.success('Settings saved!');
      setSettingsOpen(false);
    } catch (error) {
      toast.error('Save failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Project not found</p></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full" data-testid="back-btn"><ChevronLeft className="w-5 h-5" /></Button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-semibold truncate max-w-[200px]">{project.title}</span>
          <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1"><Check className="w-3 h-3" /> Educational Version</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} className="rounded-full" data-testid="settings-btn"><Settings className="w-4 h-4 mr-2" />Settings</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/preview/${projectId}`)} className="rounded-full" data-testid="preview-btn"><Eye className="w-4 h-4 mr-2" />Preview</Button>
          <Button size="sm" onClick={handleExport} className="rounded-full" data-testid="export-btn"><Download className="w-4 h-4 mr-2" />Export HTML</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-border bg-muted/30 flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Chapters</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} data-testid="import-pdf-btn"><Upload className="w-4 h-4" /></Button>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setNewChapterOpen(true)} data-testid="add-chapter-btn"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {chapters.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-primary/50" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">No chapters yet</p>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setNewChapterOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Chapter</Button>
                </div>
              ) : chapters.map((chapter, index) => (
                <div key={chapter.id} className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${selectedChapter?.id === chapter.id ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-accent'}`} onClick={() => setSelectedChapter(chapter)} data-testid={`chapter-item-${index}`}>
                  <GripVertical className="w-4 h-4 opacity-40" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chapter.title}</p>
                    <p className={`text-xs mt-0.5 ${selectedChapter?.id === chapter.id ? 'opacity-70' : 'text-muted-foreground'}`}><Clock className="w-3 h-3 inline mr-1" />{chapter.reading_time || 1} min read</p>
                  </div>
                  <Button variant="ghost" size="icon" className={`h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${selectedChapter?.id === chapter.id ? 'hover:bg-white/20' : ''}`} onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedChapter ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
                <Input value={selectedChapter.title} onChange={(e) => setSelectedChapter({ ...selectedChapter, title: e.target.value })} className="text-xl font-heading font-semibold border-none shadow-none px-0 focus-visible:ring-0 flex-1 mr-4 bg-transparent" placeholder="Chapter title" data-testid="chapter-title-input" />
                <Button size="sm" onClick={handleSaveChapter} disabled={saving} className="rounded-full" data-testid="save-chapter-btn">{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save</Button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                    <div className="flex flex-wrap gap-1 p-3 border-b border-border bg-muted/50">
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => document.execCommand('bold')}><Bold className="w-4 h-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => document.execCommand('italic')}><Italic className="w-4 h-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => document.execCommand('formatBlock', false, 'h2')}><Heading1 className="w-4 h-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => document.execCommand('insertUnorderedList')}><List className="w-4 h-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => { const url = prompt('Enter URL:'); if (url) document.execCommand('createLink', false, url); }}><Link className="w-4 h-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => { const url = prompt('Enter image URL:'); if (url) document.execCommand('insertImage', false, url); }}><Image className="w-4 h-4" /></Button>
                    </div>
                    <div contentEditable className="min-h-[500px] p-6 outline-none prose prose-slate dark:prose-invert max-w-none focus:ring-0" style={{ lineHeight: 1.9 }} onInput={(e) => setSelectedChapter({ ...selectedChapter, content: e.currentTarget.innerHTML })} dangerouslySetInnerHTML={{ __html: selectedChapter.content }} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary/40" />
                </div>
                <p className="text-xl text-muted-foreground mb-6">Select or create a chapter</p>
                <Button variant="outline" className="rounded-full" onClick={() => setNewChapterOpen(true)}><Plus className="w-4 h-4 mr-2" />New Chapter</Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Chapter Dialog */}
      <Dialog open={newChapterOpen} onOpenChange={setNewChapterOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-heading text-xl">New Chapter</DialogTitle><DialogDescription>Add a new chapter to your webbook</DialogDescription></DialogHeader>
          <div className="py-4"><Label htmlFor="chapterTitle">Chapter Title</Label><Input id="chapterTitle" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} placeholder="e.g., Day 1: Introduction" className="rounded-xl" data-testid="new-chapter-title-input" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setNewChapterOpen(false)} className="rounded-full">Cancel</Button><Button onClick={handleCreateChapter} className="rounded-full" data-testid="create-chapter-btn"><Sparkles className="w-4 h-4 mr-2" />Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-heading text-xl">Project Settings</DialogTitle><DialogDescription>Customize your webbook</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Title</Label><Input value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} className="rounded-xl" /></div>
            <div><Label>Description</Label><Textarea value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} rows={3} className="rounded-xl" /></div>
            <div><Label>Primary Color</Label><div className="flex gap-2 mt-2"><input type="color" value={project.settings?.primary_color || '#8B5CF6'} onChange={(e) => setProject({ ...project, settings: { ...project.settings, primary_color: e.target.value } })} className="w-12 h-12 rounded-xl cursor-pointer border-0" /><Input value={project.settings?.primary_color || '#8B5CF6'} onChange={(e) => setProject({ ...project, settings: { ...project.settings, primary_color: e.target.value } })} className="rounded-xl" /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSettingsOpen(false)} className="rounded-full">Cancel</Button><Button onClick={handleSaveSettings} className="rounded-full">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={(open) => { setCheckoutOpen(open); if (!open) setProcessingPayment(false); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-center font-heading text-2xl">Publish Your Webbook</DialogTitle></DialogHeader>
          <div className="py-6">
            <div className="text-5xl font-heading font-bold gradient-text mb-2 text-center">$25</div>
            <p className="text-muted-foreground mb-6 text-center">One-time payment to publish</p>

            {/* Payment Methods */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Select Payment Method</Label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => method.enabled && setSelectedPaymentMethod(method.id)}
                    disabled={!method.enabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedPaymentMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : method.enabled
                          ? 'border-border hover:border-primary/50'
                          : 'border-border opacity-50 cursor-not-allowed'
                      }`}
                    data-testid={`payment-method-${method.id}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedPaymentMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                      {getPaymentMethodIcon(method.id)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedPaymentMethod === method.id && method.enabled && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                    {!method.enabled && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Soon</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <ul className="text-left space-y-2 mb-6 text-sm">
              {['Export standalone HTML', 'Host anywhere', 'Unlimited readers', 'Lifetime access'].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div>{item}</li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={processingPayment || !paymentMethods.find(m => m.id === selectedPaymentMethod)?.enabled}
              className="w-full btn-shine rounded-full"
              size="lg"
              data-testid="proceed-payment-btn"
            >
              {processingPayment ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <>{getPaymentMethodIcon(selectedPaymentMethod)}<span className="ml-2">Pay with {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Card'}</span></>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
