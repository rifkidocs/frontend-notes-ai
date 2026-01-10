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
        console.warn('[CursorTracker] Socket not available, cannot start tracking yet');
        return;
    }

    this.isStarted = true;

    // Listen for other users' cursor movements
    const handleCursorMoved = (data: {
      userId: string;
      userName: string;
      position: LineCh;
      color: string;
    }) => {
      // Get the latest user ID from the store inside the handler
      const currentUserId = useAuthStore.getState().user?.id;
      
      // Don't track our own cursor
      if (data.userId === currentUserId) {
        return;
      }

      collabStore.updateCursor(data.userId, data.position, data.userName, data.color);
    };

    // Register event listener
    socket.on('cursor:moved', handleCursorMoved);

    // Track cursor position changes in editor
    if (this.editor) {
      const handleTransaction = ({ transaction }: { transaction: any }) => {
        // Only broadcast if the selection actually changed
        if (!transaction.selectionSet) return;

        // If the document changed and we are in read-only mode, 
        // it means we just applied a remote update. Don't broadcast our cursor.
        if (transaction.docChanged && !this.editor?.isEditable) return;

        // Only send cursor updates if the editor is focused
        if (this.editor?.isFocused) {
          // Additional check for read-only: only send if it's likely a user interaction
          // (not a programmatic selection change caused by remote update)
          if (!this.editor.isEditable && !transaction.getMeta('pointer')) {
            // If it's not a pointer event and not editable, it's probably programmatic
            // We'll skip it to avoid "ghost cursors" following the typing user
            return;
          }

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