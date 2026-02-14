import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const projects = [
    {
      id: 1,
      title: "EFT po Toksycznym Związku",
      updatedAt: "2 hours ago",
      status: "Published",
      pages: 84,
      thumbnail: "🧘"
    },
    {
      id: 2,
      title: "Scaling Your Business",
      updatedAt: "1 day ago",
      status: "Draft",
      pages: 120,
      thumbnail: "💼"
    },
    {
      id: 3,
      title: "Mindfulness dla Początkujących",
      updatedAt: "3 days ago",
      status: "Draft",
      pages: 45,
      thumbnail: "🌿"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here are your recent projects.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">45.2K</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12,450 PLN</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="relative p-0 h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-t-xl">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{project.thumbnail}</span>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2 mb-4">
                    <Clock className="w-3 h-3" /> Updated {project.updatedAt}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-slate-500">{project.pages} pages</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Card */}
            <Card className="border-dashed border-2 flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Create New Project</h3>
              <p className="text-sm text-slate-500 mt-1">Start from a template or scratch</p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
