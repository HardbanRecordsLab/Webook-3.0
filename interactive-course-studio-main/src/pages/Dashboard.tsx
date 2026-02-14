import { DashboardLayout } from "@/components/DashboardLayout";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MoreVertical, Edit, Trash2, Eye, Sparkles, TrendingUp, Users, DollarSign } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Webbook, createWebbook } from "@/types/webbook";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface DashboardProps {
  onStart: (webbook: Webbook) => void;
}

export default function Dashboard({ onStart }: DashboardProps) {
  const projects = [
    {
      id: 1,
      title: "Kurs: EFT po Toksycznym Związku",
      description: "Kompleksowy przewodnik o uwalnianiu emocji po trudnych relacjach.",
      updatedAt: "2 godziny temu",
      status: "Opublikowany",
      pages: 12,
      thumbnail: "🧘"
    },
    {
      id: 2,
      title: "Skalowanie Biznesu Online",
      description: "Strategie wzrostu dla e-commerce i usług cyfrowych.",
      updatedAt: "1 dzień temu",
      status: "Szkic",
      pages: 5,
      thumbnail: "💼"
    },
    {
      id: 3,
      title: "Mindfulness dla Początkujących",
      description: "Wprowadzenie do medytacji uważności w codziennym życiu.",
      updatedAt: "3 dni temu",
      status: "Szkic",
      pages: 8,
      thumbnail: "🌿"
    }
  ];

  const handleCreateNew = () => {
    const newWebbook = createWebbook("Nowy Kurs");
    onStart(newWebbook);
  };

  return (
    <DashboardLayout onNewProject={handleCreateNew}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Studio Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg">Twórz, zarządzaj i publikuj swoje webbooki w jednym miejscu.</p>
          </div>
          <AnimatedButton 
            onClick={handleCreateNew} 
            variant="primary" 
            size="lg"
            icon={<Plus className="w-5 h-5" />}
          >
            Nowy Projekt
          </AnimatedButton>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="elevated" className="bg-white/50 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Wszystkie Projekty</p>
                <h3 className="text-3xl font-bold text-slate-900">12</h3>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="elevated" className="bg-white/50 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-xl text-teal-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Wyświetlenia</p>
                <h3 className="text-3xl font-bold text-slate-900">45.2K</h3>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="elevated" className="bg-white/50 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Przychód</p>
                <h3 className="text-3xl font-bold text-[#f59e0b]">12,450 PLN</h3>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#f59e0b]" /> Ostatnie Projekty
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <div 
              onClick={handleCreateNew}
              className="group relative h-full min-h-[280px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-[#f59e0b] hover:bg-orange-50/30 transition-all duration-300 overflow-hidden"
            >
              <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#f59e0b] transition-all duration-300 z-10">
                <Plus className="w-10 h-10 text-slate-400 group-hover:text-[#f59e0b]" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 group-hover:text-[#f59e0b] transition-colors z-10">Utwórz Nowy Projekt</h3>
              <p className="text-slate-500 mt-2 z-10">Rozpocznij od szablonu lub od zera</p>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <InteractiveCard
                  title={project.title}
                  description={project.description}
                  icon={<span className="text-4xl">{project.thumbnail}</span>}
                  stats={[
                    { label: 'Status', value: project.status },
                    { label: 'Strony', value: `${project.pages}` }
                  ]}
                  className="h-full bg-white"
                />
                
                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur hover:bg-white text-slate-700 shadow-sm rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" /> Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> Podgląd
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
