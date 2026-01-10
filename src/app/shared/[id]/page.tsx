'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { notesApi } from '@/lib/api/notes';
import { Note } from '@/lib/types';
import { Editor } from '@/components/editor/Editor';
import { AvatarStack } from '@/components/collaboration/AvatarStack';
import { PresenceIndicator } from '@/components/collaboration/PresenceIndicator';
import { ShareModal } from '@/components/sharing/ShareModal';
import { NotesSidebar } from '@/components/notes/NotesSidebar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, LogIn, AlertCircle, Settings, Menu, X, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { socketManager } from '@/lib/websocket/socket';

export default function SharedNotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, initAuth, user } = useAuthStore();
  const { disconnect: disconnectCollab } = useCollaborationStore();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
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

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Cleanup any existing WebSocket connections on mount
  useEffect(() => {
    console.log('[SharedNote] Cleaning up any existing WebSocket connections');
    disconnectCollab();

    // Also try to emit leave for any room
    try {
      const socket = socketManager.getSocket();
      if (socket?.connected) {
        socket.emit('document:leave', { noteId: id });
      }
    } catch (err) {
      // Ignore errors
    }
  }, [id, disconnectCollab]);

  useEffect(() => {
    const loadNote = async () => {
      setLoading(true);
      setError(null);

      // 1. First, try to fetch as public note to check access level
      let publicNote: Note | null = null;
      try {
        publicNote = await notesApi.getPublic(id);
      } catch (err) {
        // Not a public note, will try private access below
      }

      // 2. If authenticated, check if user should be redirected to full editor
      // For VIEW-only public notes: only owner gets redirected
      // For EDIT public notes: owner and authenticated users get redirected
      if (isAuthenticated && publicNote) {
        const currentUserId = useAuthStore.getState().user?.id;
        const isOwner = publicNote.ownerId === currentUserId;
        const hasExplicitEditAccess = publicNote.sharedAccess?.some(
          (access) => access.userId === currentUserId && access.accessLevel === 'EDIT'
        );

        console.log('[SharedNote] Access check:', {
          noteId: id,
          currentUserId,
          ownerId: publicNote.ownerId,
          isOwner,
          publicAccess: publicNote.publicAccess,
          hasExplicitEditAccess,
        });

        // Determine if user can edit this note
        let canEdit = false;

        if (publicNote.publicAccess === 'EDIT') {
          // Public EDIT: owner + authenticated users with explicit access
          canEdit = isOwner || hasExplicitEditAccess;
        } else {
          // Public VIEW: only owner can edit (via full editor)
          canEdit = isOwner;
        }

        console.log('[SharedNote] Can edit?', canEdit);

        if (canEdit) {
          console.log('[SharedNote] Redirecting to full editor');
          try {
            await notesApi.get(id);
            router.replace(`/notes/${id}`);
            return;
          } catch (err) {
            console.log('[SharedNote] Failed to access private note, showing public view');
            // Fall through to show public view
          }
        } else {
          console.log('[SharedNote] Showing read-only public view');
        }
      }

      // 3. Show public note (read-only if VIEW access)
      if (publicNote) {
        setNote(publicNote);
      } else {
        setError('Note not found or you do not have access.');
      }

      setLoading(false);
    };

    loadNote();
  }, [id, isAuthenticated, router, disconnectCollab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background p-4 text-center">
           <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
           </div>
           <p className="text-lg font-medium text-foreground">{error}</p>
           {!isAuthenticated && (
             <Button onClick={() => router.push(`/login?callbackUrl=/shared/${id}`)}>
               <LogIn className="mr-2 h-4 w-4"/> Login to Access
             </Button>
           )}
           <Button variant="ghost" onClick={() => router.push('/')}>Go Home</Button>
        </div>
     );
  }

  if (!note) return null;

  const isViewOnly = note.publicAccess === 'VIEW';
  const isOwner = user?.id === note.ownerId;

  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - read only, no edit functionality */}
      <NotesSidebar
        noteId={id}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        readOnly
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center px-4 md:px-6 gap-2 md:gap-4 backdrop-blur-sm bg-background/50">
          {/* Left: Menu Toggle + Back Button */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => router.push('/')}
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Title */}
          <div className="flex-1 min-w-0">
            <div className="text-center">
              <h1 className="text-base font-semibold text-foreground truncate max-w-2xl mx-auto">
                {note.title}
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${isViewOnly ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                {isViewOnly ? 'View Only' : 'Public'}
                {!isViewOnly && isAuthenticated && !isOwner && (
                  <span className="text-xs">• You can edit this note</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Collaboration indicators */}
            <div className="hidden md:flex items-center gap-2">
              <PresenceIndicator />
              <AvatarStack maxVisible={3} />
            </div>

            <Separator orientation="vertical" className="h-6 hidden md:block" />

            {/* Action buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              {isAuthenticated && !isOwner && !isViewOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/notes/${id}`)}
                  title="Open in Editor"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              {isAuthenticated && isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/notes/${id}`)}
                  title="Open Your Note"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Your Note</span>
                </Button>
              )}

              {!isAuthenticated && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/login?callbackUrl=/shared/${id}`)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden relative">
          {isViewOnly && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-start justify-center pt-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                This note is view-only
              </div>
            </div>
          )}
          <Editor
            key={id}
            content={note.content}
            editable={false}
            noteId={id}
          />
        </div>
      </div>
    </div>
  );
}
