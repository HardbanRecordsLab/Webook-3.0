import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Zap, Trophy, FileText, Upload, Palette, Play, ArrowRight, Check, Sparkles, BarChart3, MessageSquare, Bookmark, Moon, Sun, Menu, X, CreditCard, LogIn, Star, Users, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      login();
    }
  };

  const features = [
    { icon: <Upload className="w-6 h-6" />, title: "PDF Import", description: "Upload your PDF and automatically split into chapters with smart detection." },
    { icon: <Palette className="w-6 h-6" />, title: "Visual Editor", description: "Rich WYSIWYG editor with images, videos, and custom styling." },
    { icon: <Trophy className="w-6 h-6" />, title: "Gamification", description: "XP system, badges, progress tracking to keep learners engaged." },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Interactive Quizzes", description: "Create multiple choice, true/false, and open-ended questions." },
    { icon: <MessageSquare className="w-6 h-6" />, title: "Text-to-Speech", description: "Built-in voice reader for accessibility and convenience." },
    { icon: <Bookmark className="w-6 h-6" />, title: "Bookmarks", description: "Users can save and return to their favorite sections." },
  ];

  const testimonials = [
    { name: "Sarah Mitchell", role: "EFT Therapist", quote: "Transformed my therapy program into an engaging digital experience.", avatar: "S" },
    { name: "Marcus Chen", role: "Course Creator", quote: "The gamification features increased my course completion rate by 40%.", avatar: "M" },
    { name: "Elena Rodriguez", role: "Educator", quote: "Finally a tool that makes creating interactive content simple.", avatar: "E" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 animated-gradient opacity-50 pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-xl">Webbook</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium border border-primary/20">PRO</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="theme-toggle">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {user ? (
              <Button onClick={() => navigate('/dashboard')} data-testid="go-dashboard-btn" className="hidden sm:flex btn-shine rounded-full">
                Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={login} data-testid="login-btn" className="hidden sm:flex btn-shine rounded-full">
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl p-4 space-y-4 animate-fade-in-up">
            <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#testimonials" className="block text-muted-foreground hover:text-foreground">Reviews</a>
            <Button onClick={handleGetStarted} className="w-full rounded-full">
              {user ? 'Go to Dashboard' : 'Sign In with Google'}
            </Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative container max-w-7xl mx-auto px-4 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Professional Webbook Platform</span>
            </div>
            
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-[1.1]">
              Transform content into{' '}
              <span className="gradient-text">interactive</span>{' '}
              experiences
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
              Create stunning webbooks with gamification, quizzes, and multimedia. 
              Export as standalone HTML and publish anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" onClick={handleGetStarted} data-testid="hero-cta-btn" className="btn-shine rounded-full text-lg px-8 py-6 glow-hover">
                <Play className="w-5 h-5 mr-2" /> Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.open('https://magdalena-iskra.vercel.app/', '_blank')} data-testid="demo-btn" className="rounded-full text-lg px-8 py-6">
                View Demo
              </Button>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex -space-x-3">
                {['bg-violet-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'].map((bg, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full ${bg} border-2 border-background flex items-center justify-center text-white text-xs font-medium`}>
                    {['S', 'M', 'E', 'J'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground">Trusted by 500+ creators</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl opacity-60" />
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 p-8 overflow-hidden">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-auto text-xs text-muted-foreground font-mono">webbook-editor.pro</span>
                </div>
                <div className="space-y-3">
                  <div className="h-5 bg-gradient-to-r from-primary to-purple-500 rounded-full w-2/3" />
                  <div className="h-3 bg-muted rounded-full w-full" />
                  <div className="h-3 bg-muted rounded-full w-4/5" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-28 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Trophy className="w-10 h-10 text-primary/60" />
                  </div>
                  <div className="h-28 bg-gradient-to-br from-pink-500/10 to-amber-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
                    <BarChart3 className="w-10 h-10 text-pink-500/60" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                  </div>
                  <span className="text-sm font-semibold text-primary">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger-children">
            {[
              { value: '500+', label: 'Creators' },
              { value: '2,000+', label: 'Webbooks Published' },
              { value: '50k+', label: 'Active Learners' },
              { value: '4.9/5', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-heading text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Features</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Everything you need to create
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional tools for building engaging educational content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, idx) => (
            <Card key={idx} className="premium-card rounded-2xl" data-testid={`feature-card-${idx}`}>
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/30 py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Pricing</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">Pay only when you're ready to publish</p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="premium-card rounded-3xl overflow-hidden border-2 border-primary/30">
              <div className="bg-gradient-to-r from-primary to-purple-500 p-1">
                <div className="bg-card rounded-t-2xl px-8 pt-8 pb-6">
                  <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-primary/10 rounded-full">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-primary text-sm font-medium">Per Webbook</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-6xl font-bold">$25</span>
                    <span className="text-muted-foreground text-lg">one-time</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-8 space-y-6">
                <ul className="space-y-4">
                  {[
                    'Unlimited chapters',
                    'Quizzes & gamification',
                    'Text-to-Speech included',
                    'Custom branding & colors',
                    'Standalone HTML export',
                    'Host anywhere you want',
                    'Lifetime access to webbook'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleGetStarted} className="w-full btn-shine rounded-full text-lg py-6" size="lg" data-testid="pricing-cta-btn">
                  {user ? 'Go to Dashboard' : 'Get Started Now'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  One payment. Publish and host anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Loved by creators
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="premium-card rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-lg mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMzLjE3NSAwIDYuMTQtLjgxOCA4LjcxNS0yLjI1N2ExLjUgMS41IDAgMDEyLjAyOC40OTRjLjQ4NS43OCAxLjUyNi45NzcgMi4yMzYuMzMzYTEuNSAxLjUgMCAwMC4zMzMtMi4yMzZMMzYgMTh6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
          <div className="relative p-12 md:p-20 text-center text-white">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Ready to create your webbook?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join thousands of creators building engaging educational experiences.
            </p>
            <Button size="lg" variant="secondary" onClick={handleGetStarted} data-testid="final-cta-btn" className="btn-shine rounded-full text-lg px-10 py-6">
              {user ? 'Open Dashboard' : 'Start Creating'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-semibold">Webbook Generator</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="mailto:hardbanrecordslab.pl@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Kamil Skomra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
