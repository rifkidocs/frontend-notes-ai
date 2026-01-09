// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'GOOGLE' | 'GITHUB';
  createdAt: string;
  lastLoginAt: string;
}

// Note Types
export interface Note {
  id: string;
  title: string;
  content: NoteContent;
  icon: string | null;
  coverImage: string | null;
  isDeleted: boolean;
  isArchived: boolean;
  isPublic: boolean;
  publicAccess: 'VIEW' | 'EDIT' | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  sharedAccess?: SharedAccess[];
}

// API Content Format
export interface NoteContent {
  type: 'doc';
  children: ContentNode[];
}

export interface ContentNode {
  type: string;
  content?: TextNode[];
  children?: ContentNode[];
  attrs?: Record<string, any>;
}

export interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
}

export interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

// Sharing Types
export interface SharedAccess {
  id: string;
  accessLevel: 'VIEW' | 'EDIT';
  noteId: string;
  userId: string | null;
  user?: User;
  inviteEmail: string | null;
  inviteToken: string | null;
  inviteExpiresAt: string | null;
  inviteAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SharingSettings {
  isPublic: boolean;
  publicAccess: 'VIEW' | 'EDIT' | null;
  sharedAccess: SharedAccess[];
}

// Pagination Types
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Collaboration Types
export interface CollaborationUser {
  userId: string;
  userName: string;
  socketId: string;
  color: string;
}

export interface CursorPosition {
  line: number;
  ch: number;
}

export interface DocumentOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  length?: number;
  text?: string;
}

// AI Types
export interface AIResponse {
  content?: string;
  correctedText?: string;
  continuation?: string;
  summary?: string;
  expansion?: string;
  outline?: string;
  model: string;
}

export type AIPrompt =
  | 'fixGrammar'
  | 'continueWriting'
  | 'summarize'
  | 'expand'
  | 'generateBlog'
  | 'generateOutline';

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// API Error Types
export interface APIError {
  error: string;
  message: string;
  status?: number;
}

// WebSocket Event Types
export type SocketEvent =
  | { type: 'document:users'; data: { users: CollaborationUser[] } }
  | { type: 'document:user:joined'; data: CollaborationUser }
  | { type: 'document:user:left'; data: { userId: string; socketId: string } }
  | { type: 'document:updated'; data: DocumentUpdate }
  | { type: 'document:conflict'; data: { currentVersion: number; yourVersion: number } }
  | { type: 'cursor:moved'; data: CursorUpdate }
  | { type: 'error'; data: { message: string } };

export interface DocumentUpdate {
  operations: DocumentOperation[];
  version: number;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface CursorUpdate {
  userId: string;
  userName: string;
  position: CursorPosition;
  color: string;
}

// Form Types
export interface CreateNoteData {
  title?: string;
  content?: NoteContent;
}

export interface UpdateNoteData {
  title?: string;
  content?: NoteContent;
  icon?: string;
  coverImage?: string;
}

export interface InviteUserData {
  email: string;
  accessLevel: 'VIEW' | 'EDIT';
}
