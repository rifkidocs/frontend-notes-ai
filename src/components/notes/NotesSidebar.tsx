"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Plus,
  LogOut,
  Home,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

const navigation = [
  { name: "My Notes", href: "/dashboard", icon: Home },
  { name: "Shared with me", href: "/shared", icon: Users },
];

// Animation variants for text elements
const navItemVariants = {
  open: {
    x: 0,
    opacity: 1,
    display: "flex",
  },
  closed: {
    x: -20,
    opacity: 0,
    transitionEnd: {
      display: "none",
    },
  },
};

interface NotesSidebarProps {
  noteId?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  readOnly?: boolean;
}

export function NotesSidebar({ noteId, isOpen = true, onToggle, isMobile = false, readOnly = false }: NotesSidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth, isLoading } = useAuthStore();

  const handleLogout = () => {
    authApi.clearTokens();
    clearAuth();
    window.location.href = "/login";
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
    <>
      <aside
        className={`glass-effect flex flex-col border-r border-border transition-all duration-300 ease-in-out overflow-hidden
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-xl' : 'relative'}
          ${isOpen ? (isMobile ? "translate-x-0" : "w-64 opacity-100") : (isMobile ? "-translate-x-full" : "w-0 opacity-0 border-r-0")}
        `}>
      {/* Logo */}
      <div className='p-4 border-b border-border h-16 flex items-center'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0'>
            <FileText className='h-5 w-5 text-primary-foreground' />
          </div>
          <AnimatePresence mode='wait'>
            {isOpen && (
              <motion.span
                variants={navItemVariants}
                initial='closed'
                animate='open'
                exit='closed'
                className='font-semibold text-lg'>
                Notes AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Note Button - hide in read-only mode */}
      {!readOnly && (
        <div className='p-4'>
          <Link href='/notes/new'>
            <Button className='w-full gap-2 shadow-md shadow-primary/20' size='sm'>
              <Plus className='h-4 w-4' />
              <AnimatePresence mode='wait'>
                {isOpen && (
                  <motion.span
                    variants={navItemVariants}
                    initial='closed'
                    animate='open'
                    exit='closed'>
                    New Note
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>
        </div>
      )}

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
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  }`}>
                  <div className='flex-shrink-0'>
                    <item.icon className='h-4 w-4' />
                  </div>
                  <AnimatePresence mode='wait'>
                    {isOpen && (
                      <motion.span
                        variants={navItemVariants}
                        initial='closed'
                        animate='open'
                        exit='closed'>
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
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
              <AvatarFallback>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  getUserInitials()
                )}
              </AvatarFallback>
            </Avatar>
          </div>
          <AnimatePresence mode='wait'>
            {isOpen && (
              <motion.div
                variants={navItemVariants}
                initial='closed'
                animate='open'
                exit='closed'
                className='flex-1 min-w-0'>
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <p className='text-sm font-medium truncate'>
                      {user?.name || "User"}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {user?.email}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
    </>
  );
}
