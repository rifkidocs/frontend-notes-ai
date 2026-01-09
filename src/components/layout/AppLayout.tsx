"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Settings,
  LogOut,
  Home,
  Users,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigation = [
  { name: "My Notes", href: "/dashboard", icon: Home },
  { name: "Shared with me", href: "/shared", icon: Users },
];

export function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, clearAuth } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }

    const loadUser = async () => {
      await fetchUser();
    };
    loadUser();
  }, [fetchUser, router]);

  const handleLogout = () => {
    authApi.clearTokens();
    clearAuth();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='flex h-screen bg-background relative'>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`glass-effect flex flex-col border-r border-border transition-all duration-300 
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-xl' : 'relative'}
          ${sidebarOpen ? (isMobile ? "translate-x-0" : "w-64") : (isMobile ? "-translate-x-full" : "w-0")} 
          ${!sidebarOpen && !isMobile ? "opacity-0 overflow-hidden" : "opacity-100"}
        `}>
        {/* Logo */}
        <div className='p-4 border-b border-border h-16 flex items-center'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0'>
              <FileText className='h-5 w-5 text-primary-foreground' />
            </div>
            <span className='font-semibold text-lg'>Notes AI</span>
          </div>
        </div>

        {/* New Note Button */}
        <div className='p-4'>
          <Link href='/notes/new'>
            <Button className='w-full gap-2 shadow-md shadow-primary/20' size='sm'>
              <Plus className='h-4 w-4' />
              <span>New Note</span>
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className='px-4 pb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search notes...'
              className='pl-10 h-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto px-3 py-2'>
          <div className='space-y-1'>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                    <div className='flex-shrink-0'>
                      <item.icon className='h-4 w-4' />
                    </div>
                    <span>{item.name}</span>
                    {isActive && (
                      <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full' />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className='p-4 border-t border-border'>
          <div className='flex items-center gap-3'>
            <div className='flex-shrink-0'>
              <Avatar className='h-10 w-10 ring-2 ring-primary/20'>
                <AvatarImage
                  src={user?.avatar || undefined}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>
                {user?.name || "User"}
              </p>
              <p className='text-xs text-muted-foreground truncate'>
                {user?.email}
              </p>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 flex-shrink-0'
              onClick={handleLogout}
              title='Logout'>
              <LogOut className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='h-16 border-b border-border flex items-center px-6 gap-4 backdrop-blur-sm bg-background/50'>
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9'
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <X className='h-4 w-4' />
            ) : (
              <Menu className='h-4 w-4' />
            )}
          </Button>
          <Separator orientation='vertical' className='h-6' />
          <div className='flex-1'>
            <h1 className='text-sm font-medium text-muted-foreground'>
              {navigation.find((item) => item.href === pathname)?.name ||
                "Notes AI"}
            </h1>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9'
            onClick={() => setSettingsOpen(true)}>
            <Settings className='h-4 w-4' />
          </Button>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto'>
          {children}
        </main>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </DialogTitle>
            <DialogDescription className="py-4">
              We're working hard to bring you the best experience. The settings feature will be available soon!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSettingsOpen(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
