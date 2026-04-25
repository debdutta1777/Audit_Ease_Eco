import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  FolderOpen,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { CustomerSupportWidget } from '@/components/support/CustomerSupportWidget';
import { supabase } from '@/integrations/supabase/client';

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Audit', href: '/audit/new', icon: FileSearch },
  { name: 'Document Vault', href: '/vault', icon: FolderOpen },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAudits, setPendingAudits] = useState(0);

  // Check for recently completed audits that might need attention
  useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      const { count } = await supabase
        .from('audits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      setPendingAudits(count || 0);
    };
    fetchPending();
  }, [user, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-card/80 backdrop-blur-xl border-border/50"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-sidebar/80 backdrop-blur-2xl" />

        {/* Animated gradient border on the right edge */}
        <div className="absolute top-0 right-0 w-[1px] h-full overflow-hidden">
          <div className="w-full h-full sidebar-gradient-border" />
        </div>

        <div className="relative flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">AuditEase</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

              // Show badge on Dashboard if there are recent audits
              const showBadge = item.href === '/dashboard' && pendingAudits > 0 && location.pathname !== '/dashboard';

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-sidebar-primary shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {/* Active indicator glow pill */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                  )}

                  <item.icon className={cn(
                    "h-5 w-5 relative z-10 transition-colors duration-200",
                    isActive && "text-primary"
                  )} />
                  <span className="relative z-10">{item.name}</span>

                  {/* Badge dot for items needing attention */}
                  {showBadge && (
                    <span className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center">
                      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400/60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-sidebar-border/50 p-4">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-xs font-medium text-sidebar-foreground ring-1 ring-emerald-500/20">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="flex-1 justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 px-3 rounded-xl"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="min-h-screen p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Customer Support Widget */}
      <CustomerSupportWidget />
    </div>
  );
}