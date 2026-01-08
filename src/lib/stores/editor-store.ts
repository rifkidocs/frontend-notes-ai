import { create } from 'zustand';
import { NoteContent } from '@/lib/types';

interface EditorState {
  content: NoteContent | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  version: number;
  saveError: string | null;

  // Actions
  setContent: (content: NoteContent) => void;
  markDirty: () => void;
  markSaved: () => void;
  resetDirty: () => void;
  incrementVersion: () => void;
  setVersion: (version: number) => void;
  setSaveError: (error: string | null) => void;
  clear: () => void;
}

const defaultContent: NoteContent = {
  type: 'doc',
  children: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
    },
  ],
};

export const useEditorStore = create<EditorState>((set) => ({
  content: defaultContent,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  version: 0,
  saveError: null,

  setContent: (content) => set({ content }),

  markDirty: () => set({ isDirty: true }),

  markSaved: () => set({ isDirty: false, isSaving: false, lastSaved: new Date(), saveError: null }),

  resetDirty: () => set({ isDirty: false }),

  incrementVersion: () => set((state) => ({ version: state.version + 1 })),

  setVersion: (version) => set({ version }),

  setSaveError: (error) => set({ saveError: error, isSaving: false }),

  clear: () =>
    set({
      content: defaultContent,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      version: 0,
      saveError: null,
    }),
}));
