import { Editor } from '@tiptap/react';
import { socketManager } from './socket';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { CollaborationUser } from '@/lib/types';
import { debounce } from '@/lib/utils/debounce';
import { useAuthStore } from '@/lib/stores/auth-store';

interface DocumentSyncOptions {
  readOnly?: boolean;
}

export class DocumentSync {
  private noteId: string;
  private editor: Editor | null;
  private cleanup: (() => void) | null = null;
  private isApplyingRemote = false;
  private debouncedUpdate: ((...args: any[]) => void) | null = null;
  private latestVersion: number = 0;
  private options: DocumentSyncOptions;

  constructor(noteId: string, editor: Editor | null, options: DocumentSyncOptions = {}) {
    this.noteId = noteId;
    this.editor = editor;
    this.options = { readOnly: false, ...options };
  }

  join() {
    console.log('[DocumentSync] Joining document room:', this.noteId, 'readOnly:', this.options.readOnly);
    const socket = socketManager.getSocket();
    const collabStore = useCollaborationStore.getState();

    // Emit join event
    socket.emit('document:join', { noteId: this.noteId, readOnly: this.options.readOnly });

    // Handle users in document
    const handleUsers = (data: { users: CollaborationUser[] }) => {
      console.log('[DocumentSync] Users in room:', data.users);
      collabStore.setUsers(data.users);
    };

    // Handle user joined
    const handleUserJoined = (user: CollaborationUser) => {
      console.log('[DocumentSync] User joined:', user);
      collabStore.addUser(user);
    };

    // Handle user left
    const handleUserLeft = (data: { userId: string; socketId: string }) => {
      console.log('[DocumentSync] User left:', data);
      collabStore.removeUser(data.userId);
    };

    // Handle document updates from other users
    const handleDocumentUpdated = (data: {
      operations: any[];
      version: number;
      userId: string;
      userName: string;
    }) => {
      // Update our local version tracker
      if (data.version > this.latestVersion) {
        this.latestVersion = data.version;
      }

      // Get current user ID reliably
      const currentUser = useAuthStore.getState().user;
      const myUserId = currentUser?.id;

      // Don't apply our own updates
      if (myUserId && data.userId === myUserId) {
        return;
      }

      // Apply operations to editor
      this.applyOperations(data.operations);
    };

    // Handle version conflicts
    const handleConflict = (data: { currentVersion: number; yourVersion: number }) => {
      console.warn('[DocumentSync] Version conflict:', data);
      // Update our version to match server's latest
      this.latestVersion = data.currentVersion;
    };

    // Register event listeners
    socket.on('document:users', handleUsers);
    socket.on('document:user:joined', handleUserJoined);
    socket.on('document:user:left', handleUserLeft);
    socket.on('document:updated', handleDocumentUpdated);
    socket.on('document:conflict', handleConflict);

    // Listen to local editor updates
    const handleLocalUpdate = () => {
        // Don't send updates if in read-only mode
        if (this.options.readOnly) {
            return;
        }

        if (this.isApplyingRemote || !this.editor) return;

        console.log('[DocumentSync] Local update detected, sending...');
        const content = this.editor.getJSON();
        // Send current version as the "base" version we are editing from
        this.sendContentUpdate(content, this.latestVersion);

        // We do NOT increment locally. We wait for the server to confirm via 'document:updated'
        // or we assume it succeeded?
        // If we don't increment, we might send the same version multiple times if we type fast?
        // But debouncing helps.
        // Also, if we receive our own update back, handleDocumentUpdated will update the version.
    };

    // Debounce the update to avoid flooding the server
    this.debouncedUpdate = debounce(handleLocalUpdate, 500);

    // Only listen to editor updates if not in read-only mode
    if (!this.options.readOnly && this.editor) {
        this.editor.on('update', this.debouncedUpdate);
    }

    // Store cleanup function
    this.cleanup = () => {
      socket.off('document:users', handleUsers);
      socket.off('document:user:joined', handleUserJoined);
      socket.off('document:user:left', handleUserLeft);
      socket.off('document:updated', handleDocumentUpdated);
      socket.off('document:conflict', handleConflict);
      
      if (this.editor && this.debouncedUpdate) {
          this.editor.off('update', this.debouncedUpdate);
      }
    };

    collabStore.setConnected(true);
  }

  leave() {
    console.log('[DocumentSync] Leaving document room:', this.noteId);
    const socket = socketManager.getSocket();

    // Emit leave event
    socket.emit('document:leave', { noteId: this.noteId });

    // Clean up event listeners
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    // Clear collaboration state
    useCollaborationStore.getState().disconnect();
  }

  sendEdit(operations: any[], version: number) {
    socketManager.emit('document:edit', {
      noteId: this.noteId,
      operations,
      version,
    });
  }

  // Helper to send full content update
  sendContentUpdate(content: any, version: number) {
    this.sendEdit([{ type: 'setContent', content }], version);
  }

  private applyOperations(operations: any[]) {
    if (!this.editor) return;
    
    console.log('[DocumentSync] Applying operations:', operations.length);
    this.isApplyingRemote = true;
    try {
        // Apply each operation to the editor
        operations.forEach((op) => {
          const { type, position, length, text, content } = op;
    
          switch (type) {
            case 'insert':
              this.editor?.chain().focus().insertContentAt(position, text || '').run();
              break;
            case 'delete':
              this.editor?.chain().focus().deleteRange({ from: position, to: position + (length || 0) }).run();
              break;
            case 'replace':
              this.editor?.chain()
                .focus()
                .deleteRange({ from: position, to: position + (length || 0) })
                .insertContentAt(position, text || '')
                .run();
              break;
            case 'setContent':
              if (content) {
                // Check if content is actually different to avoid cursor jumps if possible
                const currentContent = this.editor?.getJSON();
                if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
                    console.log('[DocumentSync] Replacing content');
                    
                    // Save cursor position
                    const { from, to } = this.editor?.state.selection || { from: 0, to: 0 };
                    
                    this.editor?.commands.setContent(content);
                    
                    // Restore cursor position if we had focus or if we want to keep position
                    // We need to ensure position is valid in new content
                    const newSize = this.editor?.state.doc.content.size || 0;
                    const safeFrom = Math.min(from, newSize);
                    const safeTo = Math.min(to, newSize);
                    
                    if (this.editor?.isFocused) {
                        this.editor?.commands.setTextSelection({ from: safeFrom, to: safeTo });
                    }
                } else {
                    console.log('[DocumentSync] Content identical, skipping replacement');
                }
              }
              break;
          }
        });
    } catch (e) {
        console.error('[DocumentSync] Error applying operations:', e);
    } finally {
        this.isApplyingRemote = false;
    }
  }
}

export function useDocumentSync(noteId: string, editor: Editor | null, options?: DocumentSyncOptions) {
  return new DocumentSync(noteId, editor, options);
}
