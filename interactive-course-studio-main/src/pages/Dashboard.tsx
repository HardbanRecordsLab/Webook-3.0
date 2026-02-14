import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MoreVertical, Edit, Trash2, Eye, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Webbook, createWebbook } from "@/types/webbook";

interface DashboardProps {
  onStart: (webbook: Webbook) => void;
}

export default function Dashboard({ onStart }: DashboardProps) {
  const projects = [
    {
      id: 1,
      title: "Kurs: EFT po Toksycznym Związku",
      updatedAt: "2 godziny temu",
      status: "Opublikowany",
      pages: 12,
      thumbnail: "🧘"
    },
    {
      id: 2,
      title: "Skalowanie Biznesu Online",
      updatedAt: "1 dzień temu",
      status: "Szkic",
      pages: 5,
      thumbnail: "💼"
    },
    {
      id: 3,
      title: "Mindfulness dla Początkujących",
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
            <h1 className="text-3xl font-serif font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Witaj z powrotem! Oto Twoje ostatnie projekty.</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-[#f59e0b] hover:bg-[#d97706] text-white gap-2 shadow-lg shadow-orange-500/20">
            <Plus className="w-4 h-4" /> Nowy Projekt
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Wszystkie Projekty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">12</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Wyświetlenia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">45.2K</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Przychód</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#f59e0b]">12,450 PLN</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-xl font-serif font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f59e0b]" /> Ostatnie Projekty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <Card 
                onClick={handleCreateNew}
                className="border-dashed border-2 border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer hover:border-[#f59e0b] hover:bg-orange-50/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#f59e0b] transition-all duration-300">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-[#f59e0b]" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-[#f59e0b] transition-colors">Utwórz Nowy Projekt</h3>
              <p className="text-sm text-slate-500 mt-1">Rozpocznij od szablonu lub od zera</p>
            </Card>

            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
                <CardHeader className="relative p-0 h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">{project.thumbnail}</span>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/10 backdrop-blur hover:bg-white/20 text-white border-0">
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
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-1 font-serif">{project.title}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2 mb-4 text-xs">
                    <Clock className="w-3 h-3" /> Zaktualizowano {project.updatedAt}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      project.status === "Opublikowany" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-slate-500 text-xs">{project.pages} stron</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
