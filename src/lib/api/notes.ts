import { apiClient } from './client';
import { Note, CreateNoteData, UpdateNoteData } from '@/lib/types';

export const notesApi = {
  // Get user's notes
  list: (params?: { page?: number; limit?: number; search?: string; includeDeleted?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.includeDeleted !== undefined)
      queryParams.append('includeDeleted', params.includeDeleted.toString());

    return apiClient.get<{
      notes: Note[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/notes?${queryParams.toString()}`);
  },

  // Get shared notes
  listShared: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiClient.get<{
      notes: Note[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/notes/shared?${queryParams.toString()}`);
  },

  // Get single note
  get: (id: string) => apiClient.get<Note>(`/notes/${id}`),

  // Create new note
  create: (data: CreateNoteData) => apiClient.post<Note>('/notes', data),

  // Update note
  update: (id: string, data: UpdateNoteData) => apiClient.patch<Note>(`/notes/${id}`, data),

  // Delete note (soft delete)
  delete: (id: string) => apiClient.delete<{ message: string }>(`/notes/${id}`),

  // Archive note
  archive: (id: string) => apiClient.patch<Note>(`/notes/${id}/archive`, {}),

  // Restore note
  restore: (id: string) => apiClient.patch<Note>(`/notes/${id}/restore`, {}),

  // Get public note (no auth required)
  getPublic: (id: string) => apiClient.get<Note>(`/notes/public/${id}`),
};
