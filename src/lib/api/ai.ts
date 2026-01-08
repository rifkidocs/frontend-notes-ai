import { apiClient } from './client';
import { AIResponse, AIPrompt } from '@/lib/types';

export const aiApi = {
  // Fix grammar
  fixGrammar: (text: string) =>
    apiClient.post<AIResponse & { correctedText: string }>('/ai/grammar', { text }),

  // Continue writing
  continue: (currentContent: string) =>
    apiClient.post<AIResponse & { continuation: string }>('/ai/continue', {
      currentContent,
    }),

  // Summarize content
  summarize: (content: string) =>
    apiClient.post<AIResponse & { summary: string }>('/ai/summarize', { content }),

  // Expand section
  expand: (section: string, topic?: string) =>
    apiClient.post<AIResponse & { expansion: string }>('/ai/expand', {
      section,
      topic: topic || section,
    }),

  // Generate blog post
  generateBlog: (topic: string, tone?: 'formal' | 'casual' | 'professional') =>
    apiClient.post<AIResponse & { content: string }>('/ai/blog', {
      topic,
      tone: tone || 'professional',
    }),

  // Generate outline
  generateOutline: (topic: string) =>
    apiClient.post<AIResponse & { outline: string }>('/ai/outline', { topic }),

  // Generate content from prompt
  generate: (prompt: string, context?: string, noteId?: string) =>
    apiClient.post<AIResponse & { content: string }>('/ai/generate', {
      prompt,
      context,
      noteId,
    }),

  // Get AI generation history for a note
  getHistory: (noteId: string) =>
    apiClient.get<
      Array<{
        id: string;
        noteId: string;
        prompt: string;
        generatedContent: string;
        model: string;
        tokensUsed: number | null;
        createdAt: string;
      }>
    >(`/ai/history/${noteId}`),

  // Helper to execute AI action based on type
  executeAction: (action: AIPrompt, text: string, context?: string) => {
    switch (action) {
      case 'fixGrammar':
        return aiApi.fixGrammar(text);
      case 'continueWriting':
        return aiApi.continue(text);
      case 'summarize':
        return aiApi.summarize(text);
      case 'expand':
        return aiApi.expand(text, context);
      case 'generateBlog':
        return aiApi.generateBlog(text);
      case 'generateOutline':
        return aiApi.generateOutline(text);
      default:
        throw new Error(`Unknown AI action: ${action}`);
    }
  },
};
