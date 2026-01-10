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
  public options: DocumentSyncOptions;
  private isJoined: boolean = false;

  constructor(noteId: string, editor: Editor | null, options: DocumentSyncOptions = {}) {
    this.noteId = noteId;
    this.editor = editor;
    this.options = { readOnly: false, ...options };
  }

  join() {
    if (this.isJoined) {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.emit('document:join', { noteId: this.noteId, readOnly: this.options.readOnly });
      }
      return;
    }
    
    const socket = socketManager.getSocket();
    if (!socket) {
      // Retry joining after a short delay if socket is not ready
      setTimeout(() => this.join(), 1000);
      return;
    }

    const collabStore = useCollaborationStore.getState();

    // Handle users in document
    const handleUsers = (data: { users: CollaborationUser[] }) => {
      console.log('[DocumentSync] Users in document:', data.users);
      collabStore.setUsers(data.users);
    };

    // Handle user joined
    const handleUserJoined = (user: any) => {
      const userName = user.userName || user.name || 'Anonymous';
      console.log('[DocumentSync] User joined:', userName);
      collabStore.addUser(user);
    };

    // Handle user left
    const handleUserLeft = (data: any) => {
      const userId = data.userId || data.id;
      if (userId) collabStore.removeUser(userId);
    };

    // Handle document updates from other users
    const handleDocumentUpdated = (data: any) => {
      // Update our local version tracker
      if (data.version > this.latestVersion) {
        this.latestVersion = data.version;
      }

      // Get current user ID reliably
      const currentUser = useAuthStore.getState().user;
      const myUserId = currentUser?.id;

      // Don't apply our own updates (check both data.userId and data.id)
      const remoteUserId = data.userId || data.id;
      if (myUserId && remoteUserId === myUserId) {
        return;
      }

      // Apply operations to editor
      this.applyOperations(data.operations);
    };

    // Handle version conflicts
    const handleConflict = (data: { currentVersion: number; yourVersion: number }) => {
      console.warn('[DocumentSync] Version conflict:', data);
      this.latestVersion = data.currentVersion;
    };

    // Register event listeners
    socket.on('document:users', handleUsers);
    socket.on('document:user:joined', handleUserJoined);
    socket.on('document:user:left', handleUserLeft);
    socket.on('document:updated', handleDocumentUpdated);
    socket.on('document:conflict', handleConflict);

    // Emit join event AFTER listeners are set up
    console.log('[DocumentSync] Emitting join for note:', this.noteId);
    socket.emit('document:join', { noteId: this.noteId, readOnly: this.options.readOnly });
    this.isJoined = true;

    // Listen to local editor updates
    const handleLocalUpdate = () => {
        if (this.options.readOnly) return;
        if (this.isApplyingRemote || !this.editor) return;

        const content = this.editor.getJSON();
        this.sendContentUpdate(content, this.latestVersion);
    };

    this.debouncedUpdate = debounce(handleLocalUpdate, 500);

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
    if (!this.isJoined) return;
    
    const socket = socketManager.getSocket();
    if (socket) {
      socket.emit('document:leave', { noteId: this.noteId });
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = null;
      }
    }

    useCollaborationStore.getState().disconnect();
    this.isJoined = false;
  }

  sendEdit(operations: any[], version: number) {
    if (typeof socketManager.emit === 'function') {
      socketManager.emit('document:edit', {
        noteId: this.noteId,
        operations,
        version,
      });
    }
  }

  sendContentUpdate(content: any, version: number) {
    this.sendEdit([{ type: 'setContent', content }], version);
  }

  private applyOperations(operations: any[]) {
    if (!this.editor) return;

    this.isApplyingRemote = true;
    try {
        operations.forEach((op) => {
          const { type, position, length, text, content } = op;

          switch (type) {
            case 'insert':
              this.editor?.chain().insertContentAt(position, text || '').run();
              break;
            case 'delete':
              this.editor?.chain().deleteRange({ from: position, to: position + (length || 0) }).run();
              break;
            case 'replace':
              this.editor?.chain()
                .deleteRange({ from: position, to: position + (length || 0) })
                .insertContentAt(position, text || '')
                .run();
              break;
            case 'setContent':
              if (content) {
                const currentContent = this.editor?.getJSON();
                if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
                    const { from, to } = this.editor?.state.selection || { from: 0, to: 0 };
                    this.editor?.commands.setContent(content);
                    const newSize = this.editor?.state.doc.content.size || 0;
                    const safeFrom = Math.min(from, newSize);
                    const safeTo = Math.min(to, newSize);
                    if (this.editor?.isFocused) {
                        this.editor?.commands.setTextSelection({ from: safeFrom, to: safeTo });
                    }
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