import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  Menu,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onNewProject?: () => void;
}

export function DashboardLayout({ children, onNewProject }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Moje Kursy", icon: BookOpen, href: "/projects" },
    { label: "Ustawienia", icon: Settings, href: "/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <span className="font-bold text-lg tracking-tight">Webbook 3.0</span>
      </div>

      <div className="px-4 mb-6">
        <Button 
            onClick={() => onNewProject?.()} 
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white gap-2 font-semibold shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" /> Nowy Projekt
        </Button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <div
            key={item.href}
            onClick={() => {
              // For now, since we don't have real routes for projects/settings, we just navigate to root
              // navigate(item.href);
              setIsMobileMenuOpen(false);
            }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
              ${location.pathname === item.href 
                ? "bg-white/10 text-[#f59e0b]" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white cursor-pointer transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Wyloguj</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-slate-800 bg-[#0f172a]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Szukaj projektów..." className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#f59e0b]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Administrator</p>
                <p className="text-xs text-slate-500">Plan Pro</p>
              </div>
              <Avatar className="border-2 border-white shadow-sm">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
