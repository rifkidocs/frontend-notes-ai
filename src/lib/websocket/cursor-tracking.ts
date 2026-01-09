import { Editor } from '@tiptap/react';
import { socketManager } from './socket';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { debounce } from '@/lib/utils/debounce';
import { getLineChFromPos, LineCh } from '@/lib/tiptap/cursor-conversion';

type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

export class CursorTracker {
  private noteId: string;
  private editor: Editor | null;
  private cleanup: (() => void) | null = null;
  private updateCursorDebounced: DebouncedFunction<(position: LineCh) => void>;

  constructor(noteId: string, editor: Editor | null) {
    this.noteId = noteId;
    this.editor = editor;
    // Debounce cursor updates to avoid excessive network traffic (100ms)
    this.updateCursorDebounced = debounce(this.sendCursorUpdate.bind(this), 100);
  }

  start() {
    const collabStore = useCollaborationStore.getState();
    const socket = socketManager.getSocket();

    // Listen for other users' cursor movements
    const handleCursorMoved = (data: {
      userId: string;
      userName: string;
      position: LineCh;
      color: string;
    }) => {
      // Don't track our own cursor
      if (data.userId === collabStore.users.find(u => u.socketId === socketManager.getSocketId())?.userId) {
        return;
      }

      collabStore.updateCursor(data.userId, data.position, data.userName, data.color);
    };

    // Register event listener
    socket.on('cursor:moved', handleCursorMoved);

    // Track cursor position changes in editor
    if (this.editor) {
      this.editor.on('selectionUpdate', () => {
        const { from } = this.editor!.state.selection;
        const position = getLineChFromPos(this.editor!.state.doc, from);
        this.updateCursorDebounced(position);
      });
    }

    // Store cleanup function
    this.cleanup = () => {
      socket.off('cursor:moved', handleCursorMoved);
      if (this.editor) {
        this.editor.off('selectionUpdate', () => {});
      }
    };
  }

  stop() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }

  private sendCursorUpdate(position: LineCh) {
    if (socketManager.isConnected()) {
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

