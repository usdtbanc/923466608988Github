import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicPageShellProps {
  children: React.ReactNode;
}

export const PublicPageShell = ({ children }: PublicPageShellProps) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    {/* Navbar — same as Landing */}
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-black text-base">U</span>
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">
            USDT BANC
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" asChild className="border-primary/30 hover:border-primary text-sm">
            <Link to="/auth?tab=login">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 glow-effect text-sm font-semibold">
            <Link to="/auth?tab=signup">
              Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>

    {/* Page content */}
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {children}
    </main>

    {/* Minimal footer */}
    <footer className="border-t border-border bg-card/60 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} USDT BANC. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:text-primary transition-colors flex items-center gap-1">
            <FileText className="h-3 w-3" /> Terms
          </Link>
          <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1">
            <Lock className="h-3 w-3" /> Privacy
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  </div>
);
