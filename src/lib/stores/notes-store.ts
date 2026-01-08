import { create } from 'zustand';
import { Note, CreateNoteData, UpdateNoteData, PaginatedResponse } from '@/lib/types';
import { apiClient } from '@/lib/api/client';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  sharedNotes: Note[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Actions
  fetchNotes: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: CreateNoteData) => Promise<Note>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  clearCurrentNote: () => void;
  searchNotes: (query: string) => Note[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  sharedNotes: [],
  isLoading: false,
  isSaving: false,
  error: null,
  pagination: null,

  fetchNotes: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const response = await apiClient.get<{
        notes: Note[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/notes?${queryParams.toString()}`);

      set({
        notes: response.notes,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
        isLoading: false,
      });
    }
  },

  fetchNote: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const note = await apiClient.get<Note>(`/notes/${id}`);
      set({ currentNote: note, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch note',
        isLoading: false,
      });
    }
  },

  createNote: async (data) => {
    set({ isSaving: true, error: null });

    try {
      const note = await apiClient.post<Note>('/notes', data);
      set((state) => ({
        notes: [note, ...state.notes],
        currentNote: note,
        isSaving: false,
      }));
      return note;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create note',
        isSaving: false,
      });
      throw error;
    }
  },

  updateNote: async (id, data) => {
    set({ isSaving: true, error: null });

    try {
      const updatedNote = await apiClient.patch<Note>(`/notes/${id}`, data);

      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update note',
        isSaving: false,
      });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    set({ isSaving: true, error: null });

    try {
      await apiClient.delete<{ message: string }>(`/notes/${id}`);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete note',
        isSaving: false,
      });
      throw error;
    }
  },

  archiveNote: async (id: string) => {
    set({ isSaving: true, error: null });

    try {
      const updatedNote = await apiClient.patch<Note>(`/notes/${id}/archive`, {});
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to archive note',
        isSaving: false,
      });
      throw error;
    }
  },

  restoreNote: async (id: string) => {
    set({ isSaving: true, error: null });

    try {
      const updatedNote = await apiClient.patch<Note>(`/notes/${id}/restore`, {});
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to restore note',
        isSaving: false,
      });
      throw error;
    }
  },

  setCurrentNote: (note) => set({ currentNote: note }),

  clearCurrentNote: () => set({ currentNote: null }),

  searchNotes: (query: string) => {
    const state = get();
    if (!query.trim()) return state.notes;

    return state.notes.filter((note) =>
      note.title.toLowerCase().includes(query.toLowerCase())
    );
  },
}));
