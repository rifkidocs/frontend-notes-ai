'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import { AIContextMenu } from '@/components/editor/AIContextMenu';
import { AvatarStack } from '@/components/collaboration/AvatarStack';
import { PresenceIndicator } from '@/components/collaboration/PresenceIndicator';
import { ShareModal } from '@/components/sharing/ShareModal';
import { NotesSidebar } from '@/components/notes/NotesSidebar';
import { useNotesStore } from '@/lib/stores/notes-store';
import { useEditorStore } from '@/lib/stores/editor-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { useDocumentSync } from '@/lib/websocket/document-sync';
import { useCursorTracking } from '@/lib/websocket/cursor-tracking';
import { socketManager } from '@/lib/websocket/socket';
import { NoteContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2, ArrowLeft, Share2, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils/debounce';

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const { user } = useAuthStore();
  const { currentNote, isLoading, fetchNote, updateNote, createNote } = useNotesStore();
  const { isSaving, markSaved, setSaveError } = useEditorStore();
  const { connect: connectCollab, disconnect: disconnectCollab } = useCollaborationStore();

  const [title, setTitle] = useState('');
  const [editor, setEditor] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Setup real-time collaboration for existing notes
  useEffect(() => {
    if (noteId === 'new' || !editor) return;

    // Connect to collaboration
    connectCollab(noteId);
    const documentSync = useDocumentSync(noteId, editor);
    const cursorTracker = useCursorTracking(noteId, editor);

    // Start tracking
    documentSync.join();
    cursorTracker.start();

    // Cleanup on unmount
    return () => {
      documentSync.leave();
      cursorTracker.stop();
      disconnectCollab();
    };
  }, [noteId, editor, connectCollab, disconnectCollab]);

  // Fetch note on mount
  useEffect(() => {
    if (noteId === 'new') {
      // New note - don't fetch
      return;
    }

    fetchNote(noteId);
  }, [noteId, fetchNote]);

  // Set title when note is loaded
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
    }
  }, [currentNote]);

  // Debounced save function
  const saveNote = useCallback(
    debounce(async (noteTitle: string, noteContent: NoteContent) => {
      if (noteId === 'new') {
        // Create new note
        try {
          const newNote = await createNote({
            title: noteTitle,
            content: noteContent,
          });
          router.replace(`/notes/${newNote.id}`);
          toast.success('Note created');
        } catch (error) {
          setSaveError(error instanceof Error ? error.message : 'Failed to create note');
          toast.error('Failed to create note');
        }
      } else {
        // Update existing note
        try {
          await updateNote(noteId, {
            title: noteTitle,
            content: noteContent,
          });
          markSaved();
          toast.success('Note saved');
        } catch (error) {
          setSaveError(error instanceof Error ? error.message : 'Failed to save note');
          toast.error('Failed to save note');
        }
      }
    }, 1000),
    [noteId, createNote, updateNote, router, markSaved, setSaveError]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (content: NoteContent) => {
      setHasChanges(true);
      saveNote(title, content);
    },
    [title, saveNote]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setHasChanges(true);
      // Will trigger save via content change or debounced separately
    },
    [saveNote]
  );

  // Handle title blur to save
  const handleTitleBlur = useCallback(() => {
    if (hasChanges && editor) {
      const content = editor.getJSON();
      saveNote(title, content);
    }
  }, [hasChanges, title, editor, saveNote]);

  if (isLoading && noteId !== 'new') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initialContent = currentNote?.content || {
    type: 'doc',
    children: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      },
    ],
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <NotesSidebar noteId={noteId} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Title Input */}
          <div className="flex-1">
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Untitled"
              className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasChanges ? (
              <>
                <Save className="h-4 w-4" />
                Unsaved
              </>
            ) : (
              'Saved'
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Presence Indicator */}
            <PresenceIndicator />

            {/* Collaborator Avatars */}
            <AvatarStack maxVisible={3} />

            {/* Share Button */}
            <ShareModal noteId={noteId} noteTitle={title || 'Untitled'} />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>

            {/* User Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            content={initialContent}
            onChange={handleContentChange}
            onEditorReady={(editorInstance) => setEditor(editorInstance)}
          />
          <AIContextMenu editor={editor} />
        </div>
      </div>
    </div>
  );
}
