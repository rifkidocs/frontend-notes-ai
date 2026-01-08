import { NoteContent, ContentNode } from '@/lib/types';

/**
 * Convert API content format to TipTap format
 * API uses "children", TipTap uses "content"
 */
export function apiToTipTap(apiContent: NoteContent | any): any {
  if (!apiContent) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    };
  }

  // Handle top-level doc
  if (apiContent.type === 'doc' && apiContent.children) {
    return {
      type: 'doc',
      content: apiContent.children.map(apiToTipTap),
    };
  }

  // Handle nodes with children (convert to content)
  if (apiContent.children && Array.isArray(apiContent.children)) {
    return {
      type: apiContent.type || 'paragraph',
      attrs: apiContent.attrs || {},
      content: apiContent.children.map(apiToTipTap),
    };
  }

  // Handle leaf nodes (text nodes)
  if (apiContent.type === 'text') {
    const textNode: any = {
      type: 'text',
      text: apiContent.text || '',
    };

    // Add marks if present (bold, italic, etc.)
    if (apiContent.marks && Array.isArray(apiContent.marks)) {
      textNode.marks = apiContent.marks;
    }

    return textNode;
  }

  // Handle content array (if already TipTap format)
  if (apiContent.content && Array.isArray(apiContent.content)) {
    return {
      type: apiContent.type || 'paragraph',
      attrs: apiContent.attrs || {},
      content: apiContent.content,
    };
  }

  // Fallback: return as-is for unknown structures
  return apiContent;
}

/**
 * Convert TipTap format to API content format
 * TipTap uses "content", API uses "children"
 */
export function tipTapToApi(tiptapContent: any): NoteContent {
  if (!tiptapContent) {
    return {
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    };
  }

  // Handle top-level doc
  if (tiptapContent.type === 'doc') {
    return {
      type: 'doc',
      children: tiptapContent.content
        ? tiptapContent.content.map(tipTapToApi)
        : [],
    };
  }

  // Handle nodes with content (convert to children)
  if (tiptapContent.content && Array.isArray(tiptapContent.content)) {
    const apiNode: any = {
      type: tiptapContent.type,
    };

    // Add attrs if present
    if (tiptapContent.attrs) {
      apiNode.attrs = tiptapContent.attrs;
    }

    // Recursively convert content to children
    apiNode.children = tiptapContent.content.map(tipTapToApi);

    return apiNode;
  }

  // Handle leaf nodes (text nodes)
  if (tiptapContent.type === 'text') {
    const textNode: any = {
      type: 'text',
      text: tiptapContent.text || '',
    };

    // Add marks if present
    if (tiptapContent.marks) {
      textNode.marks = tiptapContent.marks;
    }

    return textNode;
  }

  // Fallback: return as-is
  return tiptapContent;
}

/**
 * Convert plain text to TipTap format
 */
export function textToTipTap(text: string): any {
  if (!text) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        },
      ],
    };
  }

  // Split by lines and create paragraphs
  const lines = text.split('\n');
  const content = lines.map((line) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: line }],
  }));

  return {
    type: 'doc',
    content,
  };
}

/**
 * Extract plain text from TipTap content
 */
export function tipTapToText(tiptapContent: any): string {
  if (!tiptapContent) return '';

  function extractText(node: any): string {
    if (!node) return '';

    // Text node
    if (node.type === 'text') {
      return node.text || '';
    }

    // Node with content
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }

    return '';
  }

  return extractText(tiptapContent);
}

/**
 * Validate if content matches expected API format
 */
export function isValidApiContent(content: any): content is NoteContent {
  if (!content || typeof content !== 'object') return false;
  if (content.type !== 'doc') return false;
  if (!content.children || !Array.isArray(content.children)) return false;
  return true;
}

/**
 * Validate if content matches expected TipTap format
 */
export function isValidTipTapContent(content: any): boolean {
  if (!content || typeof content !== 'object') return false;
  if (content.type !== 'doc') return false;
  if (!content.content || !Array.isArray(content.content)) return false;
  return true;
}
