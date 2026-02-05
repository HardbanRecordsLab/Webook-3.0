import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, BookOpen, MoreVertical, Trash2, Edit, Eye, Download, FileText, ChevronRight, Home, Moon, Sun, Upload, Loader2, FolderOpen, Calendar, LogOut, CreditCard, Check, Lock, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, createProject, deleteProject, uploadPDF, exportWebbook, createCheckout } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) { toast.error('Enter project title'); return; }
    setCreating(true);
    try {
      const res = await createProject(newProject);
      setProjects([...projects, res.data]);
      setNewProjectOpen(false);
      setNewProject({ title: '', description: '' });
      toast.success('Project created!');
      navigate(`/builder/${res.data.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handlePdfUpload = async (projectId, file) => {
    if (!file?.name.endsWith('.pdf')) { toast.error('Select a PDF file'); return; }
    setUploadingPdf(projectId);
    try {
      const res = await uploadPDF(projectId, file);
      toast.success(`Imported ${res.data.chapters} chapters`);
      loadProjects();
    } catch (error) {
      toast.error('Failed to import PDF');
    } finally {
      setUploadingPdf(null);
    }
  };

  const handleExport = async (projectId, project) => {
    if (project.payment_status !== 'paid') { toast.error('Payment required to export'); return; }
    try {
      const res = await exportWebbook(projectId);
      const blob = new Blob([res.data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Webbook exported!');
    } catch (error) {
      toast.error(error.response?.status === 402 ? 'Payment required' : 'Export failed');
    }
  };

  const handleCheckout = async (projectId) => {
    try {
      const res = await createCheckout(projectId);
      window.location.href = res.data.url;
    } catch (error) {
      toast.error('Payment error');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 animated-gradient opacity-30 pointer-events-none" />

      <header className="sticky top-0 z-50 glass">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full" data-testid="home-btn">
              <Home className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-xl">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="theme-toggle">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full" data-testid="user-menu">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="relative container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Your Projects</h1>
            <p className="text-muted-foreground">Create and manage your webbooks</p>
          </div>

          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <Button data-testid="new-project-btn" className="btn-shine rounded-full">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Create Webbook</DialogTitle>
                <DialogDescription>Start building your interactive webbook</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" placeholder="e.g., EFT Mastery Course" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="rounded-xl" data-testid="project-title-input" />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" placeholder="Brief description..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="rounded-xl" data-testid="project-description-input" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewProjectOpen(false)} className="rounded-full">Cancel</Button>
                <Button onClick={handleCreateProject} disabled={creating} className="rounded-full" data-testid="create-project-submit">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="premium-card border-dashed rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-3">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-sm">Create your first webbook and start building interactive educational content.</p>
              <Button onClick={() => setNewProjectOpen(true)} className="btn-shine rounded-full" data-testid="empty-state-new-btn">
                <Plus className="w-4 h-4 mr-2" /> Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {projects.map((project) => {
              const isPaid = true; // FREE VERSION
              return (
                <Card key={project.id} className="premium-card rounded-2xl overflow-hidden" data-testid={`project-card-${project.id}`}>
                  <div className="h-36 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-14 h-14 text-primary/20" />
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Project Unlocked
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-heading text-xl line-clamp-1">{project.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" data-testid={`project-menu-${project.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => navigate(`/builder/${project.id}`)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/preview/${project.id}`)}><Eye className="w-4 h-4 mr-2" /> Preview</DropdownMenuItem>
                          {isPaid ? (
                            <DropdownMenuItem onClick={() => handleExport(project.id, project)}><Download className="w-4 h-4 mr-2" /> Export HTML</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleCheckout(project.id)}><CreditCard className="w-4 h-4 mr-2" /> Publish ($25)</DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <label className="cursor-pointer flex items-center">
                              <Upload className="w-4 h-4 mr-2" /> Import PDF
                              <input type="file" accept=".pdf" className="hidden" onChange={(e) => handlePdfUpload(project.id, e.target.files?.[0])} disabled={uploadingPdf === project.id} />
                            </label>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">{project.description || 'No description'}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                      <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {project.total_chapters || 0} chapters</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(project.updated_at || project.created_at)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate(`/builder/${project.id}`)} disabled={uploadingPdf === project.id} data-testid={`open-project-${project.id}`}>
                        {uploadingPdf === project.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                        Open Builder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
