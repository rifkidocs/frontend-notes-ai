import { Editor } from '@tiptap/react';
import { socketManager } from './socket';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { CollaborationUser } from '@/lib/types';

export class DocumentSync {
  private noteId: string;
  private editor: Editor | null;
  private cleanup: (() => void) | null = null;

  constructor(noteId: string, editor: Editor | null) {
    this.noteId = noteId;
    this.editor = editor;
  }

  join() {
    const socket = socketManager.getSocket();
    const collabStore = useCollaborationStore.getState();

    // Emit join event
    socket.emit('document:join', { noteId: this.noteId });

    // Handle users in document
    const handleUsers = (data: { users: CollaborationUser[] }) => {
      collabStore.setUsers(data.users);
    };

    // Handle user joined
    const handleUserJoined = (user: CollaborationUser) => {
      collabStore.addUser(user);
    };

    // Handle user left
    const handleUserLeft = (data: { userId: string; socketId: string }) => {
      collabStore.removeUser(data.userId);
    };

    // Handle document updates from other users
    const handleDocumentUpdated = (data: {
      operations: any[];
      version: number;
      userId: string;
      userName: string;
    }) => {
      // Don't apply our own updates
      if (data.userId === collabStore.users.find(u => u.socketId === socketManager.getSocketId())?.userId) {
        return;
      }

      // Apply operations to editor
      this.applyOperations(data.operations);
    };

    // Handle version conflicts
    const handleConflict = (data: { currentVersion: number; yourVersion: number }) => {
      console.warn('Version conflict:', data);
      // Could trigger a fetch of the latest version
    };

    // Register event listeners
    socket.on('document:users', handleUsers);
    socket.on('document:user:joined', handleUserJoined);
    socket.on('document:user:left', handleUserLeft);
    socket.on('document:updated', handleDocumentUpdated);
    socket.on('document:conflict', handleConflict);

    // Store cleanup function
    this.cleanup = () => {
      socket.off('document:users', handleUsers);
      socket.off('document:user:joined', handleUserJoined);
      socket.off('document:user:left', handleUserLeft);
      socket.off('document:updated', handleDocumentUpdated);
      socket.off('document:conflict', handleConflict);
    };

    collabStore.setConnected(true);
  }

  leave() {
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

  private applyOperations(operations: any[]) {
    if (!this.editor) return;

    // Apply each operation to the editor
    operations.forEach((op) => {
      const { type, position, length, text } = op;

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
      }
    });
  }
}

export function useDocumentSync(noteId: string, editor: Editor | null) {
  return new DocumentSync(noteId, editor);
}
