import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Extension } from '@tiptap/react';

/**
 * Get user color based on user ID for collaboration cursors
 */
export function getUserColor(userId: string): string {
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
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Custom extension for handling keyboard shortcuts
 */
export const CustomKeymap = Extension.create({
  name: 'customKeymap',

  addKeyboardShortcuts() {
    return {
      // Headings - Ctrl+Alt+Number
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-4': () => this.editor.commands.toggleHeading({ level: 4 }),
      'Mod-Alt-5': () => this.editor.commands.toggleHeading({ level: 5 }),
      'Mod-Alt-6': () => this.editor.commands.toggleHeading({ level: 6 }),
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
      // Link
      'Mod-k': () => this.editor.commands.toggleLink(),
      // Other shortcuts
      'Mod-Shift-x': () => this.editor.commands.deleteSelection(),
      'Mod-Alt-c': () => this.editor.commands.unsetAllMarks(),
    };
  },
});

/**
 * Get all TipTap extensions
 */
export function getExtensions(options: {
  placeholder?: string;
  editable?: boolean;
}) {
  const { placeholder = "Type '/' for commands...", editable = true } = options;

  return [
    // Base extensions
    StarterKit.configure({
      history: {
        depth: 1000,
      },
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      codeBlock: false, // We'll use a custom code block if needed
    }),

    // Placeholder
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),

    // Task lists
    TaskList.configure({
      HTMLAttributes: {
        class: 'notion-task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'notion-task-item',
      },
    }),

    // Links
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 hover:text-blue-600 underline cursor-pointer',
      },
    }),

    // Images
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
    }),

    // Custom keymap
    CustomKeymap,
  ];
}

/**
 * Get minimal extensions for read-only mode
 */
export function getReadOnlyExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Link.configure({
      openOnClick: true,
    }),
  ];
}
