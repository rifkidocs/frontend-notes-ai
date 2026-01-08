import { apiClient } from './client';
import { SharingSettings, SharedAccess, InviteUserData, Note } from '@/lib/types';

export const sharingApi = {
  // Get sharing settings for a note
  getSettings: (noteId: string) =>
    apiClient.get<SharingSettings>(`/notes/${noteId}/sharing`),

  // Make note public
  makePublic: (noteId: string, accessLevel: 'VIEW' | 'EDIT' = 'VIEW') =>
    apiClient.post<Note>(`/notes/${noteId}/sharing/public`, { accessLevel }),

  // Remove public access
  removePublic: (noteId: string) =>
    apiClient.delete<Note>(`/notes/${noteId}/sharing/public`),

  // Invite user by email
  inviteUser: (noteId: string, data: InviteUserData) =>
    apiClient.post<SharedAccess>(`/notes/${noteId}/sharing/invite`, data),

  // Accept invitation
  acceptInvite: (token: string) =>
    apiClient.post<{ note: Note; accessLevel: 'VIEW' | 'EDIT' }>(
      `/notes/invite/accept/${token}`,
      {}
    ),

  // Remove user access
  removeUser: (noteId: string, accessId: string) =>
    apiClient.delete<{ message: string }>(`/notes/${noteId}/sharing/${accessId}`),

  // Update user access level
  updateAccess: (noteId: string, accessId: string, accessLevel: 'VIEW' | 'EDIT') =>
    apiClient.patch<SharedAccess>(`/notes/${noteId}/sharing/${accessId}`, {
      accessLevel,
    }),
};
