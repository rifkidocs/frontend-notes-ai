'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FileText, MoreHorizontal, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotesStore } from '@/lib/stores/notes-store';
import { Note } from '@/lib/types';
import { toast } from 'sonner';

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
          <p className="text-muted-foreground mt-1">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Notes
          </Button>
          <Button
            variant={filter === 'archived' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('archived')}
          >
            Archived
          </Button>
          <Button size="sm" onClick={handleCreateNote}>
            <FileText className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => fetchNotes()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'archived' ? 'No archived notes' : 'Create your first note to get started'}
          </p>
          {filter !== 'archived' && (
            <Button onClick={handleCreateNote}>
              <FileText className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          )}
        </div>
      )}

      {/* Notes Grid */}
      {!isLoading && !error && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => router.push(`/notes/${note.id}`)}
              onDelete={() => handleDeleteNote(note.id, note.title)}
              onArchive={() => handleArchiveNote(note.id)}
              onRestore={() => handleRestoreNote(note.id)}
              isArchivedView={filter === 'archived'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onClick,
  onDelete,
  onArchive,
  onRestore,
  isArchivedView,
}: {
  note: Note;
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
    <div
      className="group relative bg-card border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.icon && <span className="text-xl">{note.icon}</span>}
          <h3 className="font-medium truncate">{note.title || 'Untitled'}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Preview */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {getContentPreview(note)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
      </div>
    </div>
  );
}
