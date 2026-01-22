"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  History,
  AlertCircle,
  Settings,
  LogOut,
  Activity,
  Grid3x3,
  Map,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    // Only run once
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    let mounted = true;
    let subscription: any = null;
    
    const initializeAuth = async () => {
      const isDemo = isDemoModeSync();
      
      // In demo mode, skip authentication checks
      if (isDemo === true) {
        if (mounted) {
          setUser({ id: "demo-user", email: "demo@example.com" } as any);
        }
        return;
      }

      // If demo mode is not determined yet, check async
      if (isDemo === null) {
        const { isDemoMode } = await import("@/lib/demo/isDemoMode");
        const demoMode = await isDemoMode();
        if (demoMode && mounted) {
          setUser({ id: "demo-user", email: "demo@example.com" } as any);
          return;
        }
      }

      // Not in demo mode, proceed with normal auth
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) {
          setUser(user);
        }
      };
      
      getUser();

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (mounted) {
          setUser(session?.user ?? null);
          if (!session) {
            router.push("/login");
          }
        }
      });
      
      subscription = sub;
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const handleSignOut = async () => {
    const isDemo = isDemoModeSync();
    if (!isDemo) {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } else {
      // In demo mode, just show message
      alert("Demo mode: Sign out not available. Configure Supabase to enable authentication.");
    }
  };

      const navigation = [
        { name: "Overview", href: "/overview", icon: Grid3x3 },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Map", href: "/map", icon: Map },
        { name: "Pumps", href: "/pumps", icon: Activity },
        { name: "History", href: "/history", icon: History },
        { name: "Alerts", href: "/alerts", icon: AlertCircle },
        { name: "Settings", href: "/settings", icon: Settings },
      ];

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const openSideMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSidebarOpen(true);
  };

  const closeSideMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Left edge hover zone for side menu */}
      <div
        onMouseEnter={openSideMenu}
        onMouseLeave={closeSideMenu}
        className="fixed left-0 top-0 bottom-0 w-8 z-50 cursor-pointer"
        style={{
          background: 'transparent',
          transition: 'background-color 0.2s ease'
        }}
        title="Hover to open menu"
      />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel shadow-elevated z-50 flex items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          className="min-h-[44px] min-w-[44px]"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">HydroWorks</span>
        </Link>
      </div>

      {/* Desktop Header with Hamburger */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 h-16 glass-panel shadow-elevated z-50 items-center gap-3 px-4">
        <div
          onMouseEnter={openSideMenu}
          className="cursor-pointer"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
            className="min-h-[44px] min-w-[44px]"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">HydroWorks</span>
        </Link>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 glass-panel shadow-elevated z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseEnter={openSideMenu}
        onMouseLeave={closeSideMenu}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 shadow-soft">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <Link
              href="/"
              className="flex items-center gap-2 flex-1 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg px-2 py-1 -mx-2"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
            >
              <Activity className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="text-xl font-bold">HydroWorks</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-400 ease-out min-h-[44px] ${
                    isActive
                      ? "bg-primary/20 text-primary shadow-soft"
                      : "text-foreground hover:bg-accent/50 hover:shadow-soft"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 space-y-3 shadow-soft border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground truncate">
                {user?.email || "Demo User"}
              </div>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start min-h-[44px]"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 lg:pt-16">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
