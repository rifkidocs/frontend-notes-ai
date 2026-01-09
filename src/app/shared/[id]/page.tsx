'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { notesApi } from '@/lib/api/notes';
import { Note } from '@/lib/types';
import { Editor } from '@/components/editor/Editor';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedNotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, initAuth } = useAuthStore();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const loadNote = async () => {
      setLoading(true);
      setError(null);

      // 1. If authenticated, try to fetch as private/shared note first
      // This ensures that if we have edit rights, we get redirected to the full editor
      if (isAuthenticated) {
        try {
          await notesApi.get(id);
          // If successful, we have access. Redirect to main editor.
          router.replace(`/notes/${id}`);
          return; 
        } catch (err) {
          // If 403/404, we continue to check if it's public
          // console.log("Not accessible as private note, checking public...", err);
        }
      }

      // 2. Try to fetch as public note
      try {
        const publicNote = await notesApi.getPublic(id);
        setNote(publicNote);
      } catch (err) {
        setError('Note not found or you do not have access.');
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [id, isAuthenticated, router]);

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

  const canEditPublicly = note.publicAccess === 'EDIT';

  return (
    <div className="flex flex-col h-screen bg-background">
       <header className="h-14 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4" />
             </Button>
             <div>
                <h1 className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                   {note.title}
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                   Public View
                </p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             {!isAuthenticated && (
                <>
                  {canEditPublicly && (
                     <span className="text-xs text-muted-foreground hidden sm:inline mr-2">
                        Login to edit
                     </span>
                  )}
                  <Button size="sm" onClick={() => router.push(`/login?callbackUrl=/shared/${id}`)}>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Button>
                </>
             )}
             {isAuthenticated && (
                <Button size="sm" onClick={() => router.push(`/notes/${id}`)}>
                   Open in Editor
                </Button>
             )}
          </div>
       </header>
       
       <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
             <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Editor 
                   content={note.content} 
                   editable={false} // Read-only for public view (unless we solve anonymous editing)
                />
             </div>
          </div>
       </div>
    </div>
  );
}
