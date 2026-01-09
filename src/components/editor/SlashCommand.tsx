'use client';

import { useEffect, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  Text,
  List,
  ListOrdered,
  Quote,
  Code,
  CheckSquare,
  SeparatorHorizontal,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';

interface SlashCommandProps {
  editor: Editor | null;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

const HEADING_LEVELS = [
  { level: 1, label: 'Heading 1', description: 'Big section heading', icon: <Heading1 className="h-4 w-4" /> },
  { level: 2, label: 'Heading 2', description: 'Medium section heading', icon: <Heading2 className="h-4 w-4" /> },
  { level: 3, label: 'Heading 3', description: 'Small section heading', icon: <Heading3 className="h-4 w-4" /> },
];

export function SlashCommand({ editor }: SlashCommandProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartPos, setFilterStartPos] = useState<number | null>(null);

  // Build command list
  const getCommands = useCallback((): CommandItem[] => {
    if (!editor) return [];

    const baseCommands: CommandItem[] = [
      // Basic Text
      {
        id: 'text',
        label: 'Text',
        description: 'Just start writing with plain text',
        icon: <Text className="h-4 w-4" />,
        action: () => editor.chain().focus().setParagraph().run(),
        keywords: ['text', 'paragraph', 'p'],
      },
      // Headings
      ...HEADING_LEVELS.map((h) => ({
        id: `heading-${h.level}`,
        label: h.label,
        description: h.description,
        icon: h.icon,
        action: () => editor.chain().focus().toggleHeading({ level: h.level as any }).run(),
        keywords: [`h${h.level}`, 'heading', 'title'],
      })),
      // Lists
      {
        id: 'bullet-list',
        label: 'Bullet List',
        description: 'Create a simple bullet list',
        icon: <List className="h-4 w-4" />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        keywords: ['bullet', 'list', 'ul'],
      },
      {
        id: 'numbered-list',
        label: 'Numbered List',
        description: 'Create a numbered list',
        icon: <ListOrdered className="h-4 w-4" />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        keywords: ['number', 'list', 'ol', 'ordered'],
      },
      {
        id: 'todo-list',
        label: 'To-do List',
        description: 'Track tasks with a to-do list',
        icon: <CheckSquare className="h-4 w-4" />,
        action: () => editor.chain().focus().toggleTaskList().run(),
        keywords: ['todo', 'task', 'check'],
      },
      // Blocks
      {
        id: 'quote',
        label: 'Quote',
        description: 'Capture a quote',
        icon: <Quote className="h-4 w-4" />,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        keywords: ['quote', 'blockquote'],
      },
      {
        id: 'code',
        label: 'Code',
        description: 'Insert a code block',
        icon: <Code className="h-4 w-4" />,
        action: () => editor.chain().focus().insertContent('<pre><code></code></pre>').run(),
        keywords: ['code', 'pre', 'snippet'],
      },
      {
        id: 'divider',
        label: 'Divider',
        description: 'Visually divide blocks',
        icon: <SeparatorHorizontal className="h-4 w-4" />,
        action: () => editor.chain().focus().insertContent('<hr>').run(),
        keywords: ['divider', 'hr', 'separator'],
      },
      // Media
      {
        id: 'image',
        label: 'Image',
        description: 'Insert an image',
        icon: <ImageIcon className="h-4 w-4" />,
        action: () => {
          const url = window.prompt('Enter image URL:');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        },
        keywords: ['image', 'img', 'picture'],
      },
      {
        id: 'link',
        label: 'Link',
        description: 'Insert a link',
        icon: <LinkIcon className="h-4 w-4" />,
        action: () => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        },
        keywords: ['link', 'url', 'href'],
      },
    ];

    return baseCommands;
  }, [editor]);

  // Filter commands based on search
  const filteredCommands = getCommands().filter((cmd) => {
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(query))
    );
  });

  // Handle typing "/" to open menu
  useEffect(() => {
    if (!editor) return;

    const handleTextInput = ({ event }: { event: KeyboardEvent }) => {
      // Only handle "/" when typing
      if (event.key === '/') {
        const { from } = editor.state.selection;
        setFilterStartPos(from);

        // Get coordinates
        setTimeout(() => {
          try {
            const coords = editor.view.coordsAtPos(editor.state.selection.from);
            setPosition({
              x: coords.left,
              y: coords.bottom + 8,
            });
            setIsVisible(true);
            setSearchQuery('');
          } catch {
            // Fallback: use cursor position
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              setPosition({
                x: rect.left,
                y: rect.bottom + 8,
              });
              setIsVisible(true);
              setSearchQuery('');
            }
          }
        }, 0);
      }
    };

    const handleKeyDown = ({ event }: { event: KeyboardEvent }) => {
      // Close on Escape
      if (event.key === 'Escape' && isVisible) {
        event.preventDefault();
        closeMenu();
        return false;
      }

      // Navigate with arrows
      if (isVisible) {
        const commands = filteredCommands;
        if (commands.length === 0) return false;

        // Let browser handle default navigation for now
        // TODO: Add custom keyboard navigation
      }

      return false;
    };

    const handleInput = () => {
      if (!isVisible) return;

      // Update search query from text after "/"
      const { from } = editor.state.selection;
      if (filterStartPos !== null) {
        const text = editor.state.doc.textBetween(filterStartPos, from);
        // Remove leading "/" from search
        setSearchQuery(text.startsWith('/') ? text.slice(1) : text);

        // Hide if user deleted the "/"
        if (!text.includes('/')) {
          closeMenu();
        }
      }
    };

    editor.on('textInput', handleTextInput);
    editor.on('keydown', handleKeyDown);
    editor.on('input', handleInput);

    return () => {
      editor.off('textInput', handleTextInput);
      editor.off('keydown', handleKeyDown);
      editor.off('input', handleInput);
    };
  }, [editor, isVisible, filterStartPos, filteredCommands, searchQuery]);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setSearchQuery('');
    setFilterStartPos(null);
  }, []);

  const executeCommand = useCallback(
    (command: CommandItem) => {
      if (!editor || filterStartPos === null) return;

      // Delete the "/" and any search text
      const currentPos = editor.state.selection.from;
      editor
        .chain()
        .focus()
        .deleteRange({ from: filterStartPos, to: currentPos })
        .run();

      // Execute the command
      command.action();

      closeMenu();
    },
    [editor, filterStartPos, closeMenu]
  );

  if (!isVisible || !editor) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={closeMenu} />

      {/* Command Menu */}
      <div
        className="fixed z-50 bg-background border rounded-lg shadow-lg p-2 min-w-[280px] max-w-[360px] animate-in fade-in zoom-in-95"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="text-xs text-muted-foreground px-2 py-1.5 mb-1 font-medium">
          {searchQuery ? 'Searching...' : 'Basic blocks'}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md flex items-start gap-3 transition-colors"
                >
                  <div className="mt-0.5 text-primary flex-shrink-0">{cmd.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{cmd.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {cmd.description}
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">↵</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground px-2 py-1.5 mt-1 border-t flex items-center justify-between">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </>
  );
}
