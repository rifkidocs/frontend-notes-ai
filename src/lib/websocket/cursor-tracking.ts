import { Editor } from '@tiptap/react';
import { socketManager } from './socket';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { debounce } from '@/lib/utils/debounce';
import { getLineChFromPos, LineCh } from '@/lib/tiptap/cursor-conversion';

import { useAuthStore } from '@/lib/stores/auth-store';

type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

export class CursorTracker {
  private noteId: string;
  private editor: Editor | null;
  private cleanup: (() => void) | null = null;
  private updateCursorDebounced: DebouncedFunction<(position: LineCh) => void>;
  private isStarted: boolean = false;

  constructor(noteId: string, editor: Editor | null) {
    this.noteId = noteId;
    this.editor = editor;
    // Debounce cursor updates to avoid excessive network traffic (100ms)
    this.updateCursorDebounced = debounce(this.sendCursorUpdate.bind(this), 100);
  }

  start() {
    if (this.isStarted) return;
    
    const collabStore = useCollaborationStore.getState();
    const socket = socketManager.getSocket();

    if (!socket) {
        // If socket is not available yet, wait a bit and try again
        // This is common during initial auth loading
        setTimeout(() => this.start(), 1000);
        return;
    }

    this.isStarted = true;

    // Listen for other users' cursor movements
    const handleCursorMoved = (data: any) => {
      // Handle both naming conventions from server
      const remoteUserId = data.userId || data.id;
      const remoteUserName = data.userName || data.name;
      
      if (!remoteUserId) return;

      // Get the latest user ID from the store inside the handler
      const currentUserId = useAuthStore.getState().user?.id;
      
      // Don't track our own cursor if we have a valid user ID
      if (currentUserId && remoteUserId === currentUserId) {
        return;
      }

      collabStore.updateCursor(
        remoteUserId, 
        data.position, 
        remoteUserName || 'Anonymous', 
        data.color || '#999'
      );
    };

    // Register event listener
    socket.on('cursor:moved', handleCursorMoved);

    // Track cursor position changes in editor
    if (this.editor) {
      const handleTransaction = ({ transaction }: { transaction: any }) => {
        // Broadcast if selection changed or if it's a focus event
        // We don't just check transaction.selectionSet because we want to be responsive
        
        // If the document changed and we are in read-only mode, 
        // it means we just applied a remote update. Don't broadcast our cursor.
        if (transaction.docChanged && !this.editor?.isEditable) return;

        // Send cursor updates
        if (this.editor?.isFocused || transaction.getMeta('pointer')) {
          const { from } = transaction.selection;
          const position = getLineChFromPos(transaction.doc, from);
          this.updateCursorDebounced(position);
        }
      };

      this.editor.on('transaction', handleTransaction);

      // Store cleanup function
      this.cleanup = () => {
        socket.off('cursor:moved', handleCursorMoved);
        if (this.editor) {
          this.editor.off('transaction', handleTransaction);
        }
        this.isStarted = false;
      };
    }
  }

  stop() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.isStarted = false;
  }

  private sendCursorUpdate(position: LineCh) {
    if (socketManager.isConnected() && typeof socketManager.emit === 'function') {
        socketManager.emit('cursor:update', {
          noteId: this.noteId,
          position,
        });
    }
  }
}

export function useCursorTracking(noteId: string, editor: Editor | null) {
  return new CursorTracker(noteId, editor);
}