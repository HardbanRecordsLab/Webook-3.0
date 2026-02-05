import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, BookOpen, Trophy, Clock, Bookmark, BookmarkCheck, Volume2, PauseCircle, Check, Moon, Sun, Menu, Award, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getProject, getChapters, getProgress, completeChapter, toggleBookmark, getBadges } from '../lib/api';

export default function Preview() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const results = await Promise.all([getProject(projectId), getChapters(projectId), getProgress(projectId), getBadges()]);
      setProject(results[0].data);
      setChapters(results[1].data);
      setProgress(results[2].data);
      setBadges(results[3].data);
    } catch (error) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const currentChapter = chapters[currentChapterIndex];
  const completedChapters = progress?.completed_chapters || [];
  const progressPercent = chapters.length > 0 ? Math.round((completedChapters.length / chapters.length) * 100) : 0;

  const handleCompleteChapter = async () => {
    if (!currentChapter) return;
    try {
      const res = await completeChapter(projectId, currentChapter.id);
      setProgress(prev => ({ ...prev, completed_chapters: [...(prev?.completed_chapters || []), currentChapter.id], xp_earned: (prev?.xp_earned || 0) + res.data.xp_earned }));
      toast.success(`+${res.data.xp_earned} XP!`);
      if (currentChapterIndex < chapters.length - 1) setTimeout(() => setCurrentChapterIndex(currentChapterIndex + 1), 1000);
    } catch (error) {
      toast.error('Error');
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentChapter) return;
    try {
      const res = await toggleBookmark(projectId, currentChapter.id);
      setProgress(prev => ({ ...prev, bookmarks: res.data.bookmarked ? [...(prev?.bookmarks || []), currentChapter.id] : (prev?.bookmarks || []).filter(id => id !== currentChapter.id) }));
      toast.success(res.data.bookmarked ? 'Bookmarked' : 'Removed');
    } catch (error) {}
  };

  const handleTTS = () => {
    if (!currentChapter) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const text = currentChapter.content.replace(/<[^>]*>/g, ' ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const isBookmarked = progress?.bookmarks?.includes(currentChapter?.id);
  const isCompleted = completedChapters.includes(currentChapter?.id);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Not found</p></div>;

  const primaryColor = project.settings?.primary_color || '#8B5CF6';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => navigate(`/builder/${projectId}`)} data-testid="back-to-builder-btn"><ChevronLeft className="w-5 h-5" /></Button>
              <h1 className="font-heading font-semibold text-lg text-white">{project.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full" onClick={toggleTheme}>{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
              <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20 rounded-full" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="w-5 h-5" /></Button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1 h-2 bg-white/30" />
            <span className="text-sm text-white font-semibold">{progressPercent}%</span>
          </div>
        </div>
        <div className="bg-card border-t border-border px-4 py-3 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" /><strong>{progress?.xp_earned || 0}</strong> XP</span>
          <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" /><strong>{completedChapters.length}</strong>/{chapters.length}</span>
          <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /><strong>{progress?.streak_days || 0}</strong> days</span>
          <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-purple-500" /><strong>{progress?.badges?.length || 0}</strong> badges</span>
        </div>
      </header>

      <div className="flex">
        <aside className={`w-72 border-r border-border bg-muted/30 fixed md:sticky top-[148px] h-[calc(100vh-148px)] z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <ScrollArea className="h-full p-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-semibold">Table of Contents</h3>
            <div className="space-y-2">
              {chapters.map((chapter, index) => {
                const isActive = index === currentChapterIndex;
                const isChapterCompleted = completedChapters.includes(chapter.id);
                return (
                  <button key={chapter.id} onClick={() => { setCurrentChapterIndex(index); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-accent'}`} data-testid={`toc-item-${index}`}>
                    <div className="flex items-center gap-2">{isChapterCompleted && <Check className={`w-4 h-4 ${isActive ? '' : 'text-primary'}`} />}<span className="text-sm font-medium line-clamp-2">{chapter.title}</span></div>
                    <div className={`text-xs mt-1 ${isActive ? 'opacity-70' : 'text-muted-foreground'}`}><Clock className="w-3 h-3 inline mr-1" />{chapter.reading_time || 1} min</div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-h-[calc(100vh-148px)]">
          {currentChapter ? (
            <article className="max-w-3xl mx-auto px-6 py-12">
              <div className="mb-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span className="px-2 py-1 bg-primary/10 rounded-full text-primary font-medium">Chapter {currentChapterIndex + 1}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />{currentChapter.reading_time || 1} min read
                </div>
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">{currentChapter.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleToggleBookmark} className="rounded-full" data-testid="bookmark-btn">{isBookmarked ? <><BookmarkCheck className="w-4 h-4 mr-1.5 text-primary" />Saved</> : <><Bookmark className="w-4 h-4 mr-1.5" />Save</>}</Button>
                  {'speechSynthesis' in window && <Button variant="outline" size="sm" onClick={handleTTS} className="rounded-full" data-testid="tts-preview-btn">{speaking ? <><PauseCircle className="w-4 h-4 mr-1.5" />Stop</> : <><Volume2 className="w-4 h-4 mr-1.5" />Listen</>}</Button>}
                </div>
              </div>

              <div className="webbook-content prose prose-lg prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentChapter.content }} />

              <div className="mt-14 pt-8 border-t border-border">
                {isCompleted ? (
                  <div className="flex items-center justify-center gap-2 p-5 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20"><Check className="w-6 h-6 text-primary" /><span className="font-semibold text-lg">Chapter Completed!</span></div>
                ) : (
                  <Button size="lg" className="w-full rounded-full btn-shine text-lg py-6" onClick={handleCompleteChapter} data-testid="complete-chapter-btn"><Check className="w-5 h-5 mr-2" />Mark as Complete (+10 XP)</Button>
                )}
              </div>

              <div className="flex justify-between mt-8 gap-4">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))} disabled={currentChapterIndex === 0} data-testid="prev-chapter-btn"><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))} disabled={currentChapterIndex === chapters.length - 1} data-testid="next-chapter-btn">Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            </article>
          ) : (
            <div className="flex items-center justify-center h-full"><p className="text-muted-foreground text-lg">No chapters yet</p></div>
          )}
        </main>
      </div>
    </div>
  );
}
