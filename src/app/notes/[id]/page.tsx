'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import { AvatarStack } from '@/components/collaboration/AvatarStack';
import { PresenceIndicator } from '@/components/collaboration/PresenceIndicator';
import { ShareModal } from '@/components/sharing/ShareModal';
import { NotesSidebar } from '@/components/notes/NotesSidebar';
import { useNotesStore } from '@/lib/stores/notes-store';
import { useEditorStore } from '@/lib/stores/editor-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
// import { useDocumentSync } from '@/lib/websocket/document-sync';
// import { useCursorTracking } from '@/lib/websocket/cursor-tracking';
import { socketManager } from '@/lib/websocket/socket';
import { NoteContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, ArrowLeft, Settings, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils/debounce';

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { user } = useAuthStore();
  const { currentNote, isLoading, fetchNote, updateNote, createNote } = useNotesStore();
  const { isSaving, markSaved, setSaveError } = useEditorStore();
  const { connect: connectCollab, disconnect: disconnectCollab } = useCollaborationStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<NoteContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Setup real-time collaboration for existing notes
  useEffect(() => {
    if (noteId === 'new') return;

    // Connect to collaboration
    connectCollab(noteId);
    // const documentSync = useDocumentSync(noteId, editor);
    // const cursorTracker = useCursorTracking(noteId, editor);

    // Start tracking
    // documentSync.join();
    // cursorTracker.start();

    // Cleanup on unmount
    return () => {
      // documentSync.leave();
      // cursorTracker.stop();
      disconnectCollab();
    };
  }, [noteId, connectCollab, disconnectCollab]);

  // Fetch note on mount
  useEffect(() => {
    if (noteId === 'new') {
      // New note - don't fetch
      return;
    }

    fetchNote(noteId);
  }, [noteId, fetchNote]);

  // Set title and content when note is loaded
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      // Only set content if we haven't started editing yet?
      // Or just trust currentNote is latest source of truth on load.
      if (!content) {
          setContent(currentNote.content);
      }
    }
  }, [currentNote]); // content dependency removed to avoid reset loop

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
          setHasChanges(false);
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
          setHasChanges(false);
          // toast.success('Note saved'); // Removed to avoid spam while typing
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
    (newContent: NoteContent) => {
      setContent(newContent);
      setHasChanges(true);
      saveNote(title, newContent);
    },
    [title, saveNote]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setHasChanges(true);
      if (content) {
          saveNote(newTitle, content);
      }
    },
    [saveNote, content]
  );

  // Handle title blur to save
  const handleTitleBlur = useCallback(() => {
    if (hasChanges && content) {
      saveNote(title, content);
    }
  }, [hasChanges, title, content, saveNote]);

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
      <NotesSidebar noteId={noteId} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center px-6 gap-4 backdrop-blur-sm bg-background/50">
          {/* Left: Menu Toggle + Back Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.back()}
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Title Input */}
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Untitled"
              className="text-base font-semibold text-foreground border-none shadow-none focus-visible:ring-0 px-0 h-auto text-center max-w-2xl mx-auto"
            />
          </div>

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Unsaved
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      if (content) {
                        saveNote(title, content);
                      }
                    }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Saved
                </span>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <PresenceIndicator />
              <AvatarStack maxVisible={3} />
              <ShareModal noteId={noteId} noteTitle={title || 'Untitled'} />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            key={noteId}
            content={content || initialContent}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
