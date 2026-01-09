'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Users,
  Calendar,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import {
  MotionCard,
  MotionCardSkeleton,
  MotionButton,
} from '@/components/motion';
import { useNotesStore } from '@/lib/stores/notes-store';
import { Note } from '@/lib/types';
import { AppLayout } from '@/components/layout/AppLayout';

export default function SharedPage() {
  const router = useRouter();
  const { sharedNotes, isLoading, error, fetchSharedNotes } = useNotesStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSharedNotes();
  }, [fetchSharedNotes]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-display to-foreground bg-clip-text text-transparent"
              >
                Shared with me
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-muted-foreground mt-2 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>
                  {sharedNotes.length} {sharedNotes.length === 1 ? 'note' : 'notes'} shared with you
                </span>
              </motion.p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[1, 2, 3].map((i) => (
              <MotionCardSkeleton key={i} />
            ))}
          </motion.div>
        )}

        {/* Error State */}
        <AnimatePresence mode="wait">
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
              <MotionButton variant="outline" onClick={() => fetchSharedNotes()}>
                Try Again
              </MotionButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && !error && sharedNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
              <Users className="h-12 w-12 text-muted-foreground" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 text-accent" />
              </motion.div>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-2">No shared notes</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Notes that others share with you will appear here.
            </p>
          </motion.div>
        )}

        {/* Notes Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {!isLoading && !error && sharedNotes.length > 0 &&
            sharedNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <SharedNoteCard
                  note={note}
                  onClick={() => router.push(`/notes/${note.id}`)}
                />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}

function SharedNoteCard({
  note,
  onClick,
}: {
  note: Note;
  onClick: () => void;
}) {
  const getContentPreview = (note: Note): string => {
    try {
      if (note.content && typeof note.content === 'object') {
        const content = note.content as any;
        const extractText = (node: any): string => {
          if (!node) return '';
          if (node.type === 'text') return node.text || '';
          if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join('');
          }
          if (node.children && Array.isArray(node.children)) {
            return node.children.map(extractText).join('');
          }
          return '';
        };
        const text = extractText(content);
        return text.slice(0, 150) + (text.length > 150 ? '...' : '');
      }
    } catch (e) {
      console.error('Error extracting content preview:', e);
    }
    return 'No content';
  };

  return (
    <MotionCard
      variant="glass"
      className="group relative p-5 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {note.icon ? (
            <span className="text-2xl flex-shrink-0">{note.icon}</span>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-base truncate pr-2">
              {note.title || 'Untitled'}
            </h3>
            {note.owner && (
              <p className="text-xs text-muted-foreground">
                By {note.owner.name || note.owner.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 relative">
        {getContentPreview(note)}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground relative">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </MotionCard>
  );
}
