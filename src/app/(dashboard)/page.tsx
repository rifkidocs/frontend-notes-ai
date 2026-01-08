'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  MoreHorizontal,
  Trash2,
  Archive,
  ArchiveRestore,
  Sparkles,
  FolderOpen,
  Calendar,
  Search,
} from 'lucide-react';
import {
  MotionCard,
  MotionCardSkeleton,
  MotionButton,
  MotionList,
  MotionListItem,
  staggerContainerVariants,
} from '@/components/motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotesStore } from '@/lib/stores/notes-store';
import { Note } from '@/lib/types';
import { toast } from 'sonner';

// Animation variants
const filterVariants = {
  inactive: {
    scale: 1,
    borderColor: 'hsl(var(--border))',
  },
  active: {
    scale: 1.02,
    borderColor: 'hsl(var(--primary))',
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { notes, isLoading, error, fetchNotes, deleteNote, archiveNote, restoreNote } =
    useNotesStore();

  const [filter, setFilter] = useState<'all' | 'archived'>('all');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter((note) => {
    if (filter === 'archived') return note.isArchived;
    return !note.isArchived && !note.isDeleted;
  });

  const handleDeleteNote = async (noteId: string, title: string) => {
    try {
      await deleteNote(noteId);
      toast.success(`Note "${title}" deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    try {
      await archiveNote(noteId);
      toast.success('Note archived');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive note');
    }
  };

  const handleRestoreNote = async (noteId: string) => {
    try {
      await restoreNote(noteId);
      toast.success('Note restored');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restore note');
    }
  };

  const handleCreateNote = async () => {
    router.push('/notes/new');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 lg:p-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <motion.h1
              className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-display to-foreground bg-clip-text text-transparent"
            >
              My Notes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground mt-2 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <MotionButton
              variant="default"
              size="lg"
              onClick={handleCreateNote}
              className="gap-2 shadow-lg shadow-primary/25"
            >
              <Sparkles className="h-4 w-4" />
              <span>New Note</span>
            </MotionButton>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit"
        >
          {(['all', 'archived'] as const).map((f) => (
            <motion.button
              key={f}
              variants={filterVariants}
              animate={filter === f ? 'active' : 'inactive'}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All Notes
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archived
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
            >
              <Archive className="h-8 w-8 text-destructive" />
            </motion.div>
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
            <MotionButton variant="outline" onClick={() => fetchNotes()}>
              Try Again
            </MotionButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                {filter === 'archived' ? (
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              {/* Decorative elements */}
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
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold mt-6 mb-2"
            >
              {filter === 'archived' ? 'No archived notes' : 'No notes yet'}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-center max-w-sm mb-8"
            >
              {filter === 'archived'
                ? 'Notes you archive will appear here'
                : 'Create your first note and start capturing your ideas'}
            </motion.p>

            {filter !== 'archived' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MotionButton size="lg" onClick={handleCreateNote}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Your First Note
                </MotionButton>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && filteredNotes.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onClick={() => router.push(`/notes/${note.id}`)}
                onDelete={() => handleDeleteNote(note.id, note.title)}
                onArchive={() => handleArchiveNote(note.id)}
                onRestore={() => handleRestoreNote(note.id)}
                isArchivedView={filter === 'archived'}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NoteCard({
  note,
  index,
  onClick,
  onDelete,
  onArchive,
  onRestore,
  isArchivedView,
}: {
  note: Note;
  index: number;
  onClick: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
  isArchivedView: boolean;
}) {
  // Extract plain text from content for preview
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
      index={index}
      onClick={onClick}
      className="group relative p-5 cursor-pointer overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {note.icon ? (
            <motion.span
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-2xl flex-shrink-0"
            >
              {note.icon}
            </motion.span>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          )}
          <h3 className="font-semibold text-base truncate pr-2">
            {note.title || 'Untitled'}
          </h3>
        </div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isArchivedView ? (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRestore(); }}>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>

      {/* Preview */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 relative">
        {getContentPreview(note)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground relative">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6 }}
      />
    </MotionCard>
  );
}
