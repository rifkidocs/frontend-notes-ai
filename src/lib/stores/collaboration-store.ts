import { create } from 'zustand';
import { CollaborationUser, CursorPosition } from '@/lib/types';

interface CursorInfo {
  position: CursorPosition;
  user: { id: string; name: string };
  color: string;
}

interface CollaborationState {
  isConnected: boolean;
  users: CollaborationUser[];
  cursors: Map<string, CursorInfo>;
  myColor: string;
  currentNoteId: string | null;

  // Actions
  connect: (noteId: string) => void;
  disconnect: () => void;
  addUser: (user: CollaborationUser) => void;
  removeUser: (userId: string) => void;
  setUsers: (users: CollaborationUser[]) => void;
  updateCursor: (userId: string, position: CursorPosition, userName: string, color: string) => void;
  clearCursors: () => void;
  setConnected: (connected: boolean) => void;
}

function generateUserColor(): string {
  const colors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F033FF',
    '#FF33A8',
    '#33FFF5',
    '#FF8C33',
    '#8C33FF',
    '#FF3333',
    '#33FF99',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getColorForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F033FF',
    '#FF33A8',
    '#33FFF5',
    '#FF8C33',
    '#8C33FF',
    '#FF3333',
    '#33FF99',
  ];
  return colors[Math.abs(hash) % colors.length];
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  isConnected: false,
  users: [],
  cursors: new Map(),
  myColor: generateUserColor(),
  currentNoteId: null,

  connect: (noteId) =>
    set({
      currentNoteId: noteId,
      isConnected: false,
    }),

  disconnect: () =>
    set({
      isConnected: false,
      users: [],
      cursors: new Map(),
      currentNoteId: null,
    }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users.filter((u) => u.userId !== user.userId), user],
    })),

  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.userId !== userId),
      cursors: new Map(Array.from(state.cursors).filter(([id]) => id !== userId)),
    })),

  setUsers: (users) =>
    set({
      users,
    }),

  updateCursor: (userId: string, position: CursorPosition, userName: string, color: string) =>
    set((state) => {
      const newCursors = new Map(state.cursors);
      newCursors.set(userId, { position, user: { id: userId, name: userName }, color });
      return { cursors: newCursors };
    }),

  clearCursors: () => set({ cursors: new Map() }),

  setConnected: (connected) => set({ isConnected: connected }),
}));
