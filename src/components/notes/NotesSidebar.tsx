"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Settings,
  LogOut,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
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

// Animation variants
const sidebarVariants = {
  open: {
    width: "16rem",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  closed: {
    width: "5rem",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

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
}

export function NotesSidebar({ noteId }: NotesSidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarOpen ? "open" : "closed"}
      initial='open'
      className='glass-effect border-r flex flex-col overflow-hidden relative'>
      {/* Logo */}
      <div className='p-4 border-b border-border/50'>
        <div className='flex items-center gap-3'>
          <motion.div
            className='h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0'
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}>
            <FileText className='h-5 w-5 text-primary-foreground' />
          </motion.div>
          <AnimatePresence mode='wait'>
            {sidebarOpen && (
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

      {/* New Note Button */}
      <div className='p-4'>
        <Link href='/notes/new'>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className='w-full gap-2 shadow-md shadow-primary/20'
              size='sm'>
              <Plus className='h-4 w-4' />
              <AnimatePresence mode='wait'>
                {sidebarOpen && (
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
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto px-3 py-2'>
        <div className='space-y-1'>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground rounded-xl"
                    }`}>
                    <motion.div
                      className='flex-shrink-0'
                      whileHover={{ scale: 1.1, rotate: 5 }}>
                      <item.icon className='h-4 w-4' />
                    </motion.div>
                    <AnimatePresence mode='wait'>
                      {sidebarOpen && (
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
                      <motion.div
                        layoutId='activeTabNotes'
                        className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full'
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className='p-4 border-t border-border/50'>
        <div className='flex items-center gap-3'>
          <motion.div whileHover={{ scale: 1.05 }} className='flex-shrink-0'>
            <Avatar className='h-10 w-10 ring-2 ring-primary/20'>
              <AvatarImage
                src={user?.avatar || undefined}
                alt={user?.name || "User"}
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </motion.div>
          <AnimatePresence mode='wait'>
            {sidebarOpen && (
              <motion.div
                variants={navItemVariants}
                initial='closed'
                animate='open'
                exit='closed'
                className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>
                  {user?.name || "User"}
                </p>
                <p className='text-xs text-muted-foreground truncate'>
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 flex-shrink-0'
              onClick={handleLogout}
              title='Logout'>
              <LogOut className='h-4 w-4' />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Collapse Button */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className='absolute -right-4 top-24 h-7 w-7 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform z-[100] border-2 border-background'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}>
        <AnimatePresence mode='wait' initial={false}>
          {sidebarOpen ? (
            <motion.div
              key='collapse'
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <ChevronLeft className='h-3.5 w-3.5' strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              key='expand'
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <ChevronRight className='h-3.5 w-3.5' strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.aside>
  );
}
