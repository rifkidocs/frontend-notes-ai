'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { getExtensions } from '@/lib/tiptap/extensions';
import { apiToTipTap, tipTapToApi } from '@/lib/tiptap/schema-matcher';
import { NoteContent } from '@/lib/types';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';
import { SlashCommand } from './SlashCommand';

interface EditorProps {
  content: NoteContent;
  editable?: boolean;
  placeholder?: string;
  onChange?: (content: NoteContent) => void;
  onReady?: () => void;
  onEditorReady?: (editor: any) => void;
}

export function Editor({
  content,
  editable = true,
  placeholder = "Type '/' for commands...",
  onChange,
  onReady,
  onEditorReady,
}: EditorProps) {
  // Safely convert content, with fallback
  const safeContent = (() => {
    try {
      return apiToTipTap(content) || {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        }],
      };
    } catch {
      return {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: '' }],
        }],
      };
    }
  })();

  const editor = useEditor({
    extensions: getExtensions({ placeholder, editable }),
    content: safeContent,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        try {
          const json = editor.getJSON();
          const apiContent = tipTapToApi(json);
          onChange(apiContent);
        } catch (e) {
          console.error('Error updating editor content:', e);
        }
      }
    },
    onCreate: ({ editor }) => {
      onReady?.();
      onEditorReady?.(editor);
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor) {
      try {
        const tiptapContent = apiToTipTap(content);
        const currentContent = editor.getJSON();

        // Only update if content is different
        if (JSON.stringify(tiptapContent) !== JSON.stringify(currentContent)) {
          editor.commands.setContent(tiptapContent, false);
        }
      } catch (e) {
        // Ignore errors during initialization
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    tooltip,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`h-8 w-8 p-0 ${active ? 'bg-accent' : ''}`}
      title={tooltip}
    >
      {children}
    </Button>
  );

  return (
    <div
      className="flex flex-col h-full"
      onClick={(e) => {
        // Focus editor on click anywhere in the editor area
        if (editor && editable) {
          const target = e.target as HTMLElement;
          // Don't focus if clicking on toolbar or interactive elements
          if (!target.closest('button')) {
            editor.commands.focus('end');
          }
        }
      }}
    >
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b bg-background overflow-x-auto">
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Type */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
            tooltip="Text (Ctrl+Alt+0)"
          >
            <Type className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            tooltip="Heading 1 (Ctrl+Alt+1)"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            tooltip="Heading 2 (Ctrl+Alt+2)"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            tooltip="Heading 3 (Ctrl+Alt+3)"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            tooltip="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Blockquote */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            tooltip="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Link */}
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            active={editor.isActive('link')}
            tooltip="Insert Link (Ctrl+K)"
          >
            <Link className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Slash command hint */}
          <div className="text-xs text-muted-foreground px-2 hidden sm:block">
            Type <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">/</kbd> for commands
          </div>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto prose dark:prose-invert max-w-none focus:outline-none
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:font-mono prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-muted prose-pre:border prose-pre:border-border
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4
          prose-ul:list-disc prose-ol:list-decimal
          focus:outline-none prose-p:m-0"
      />
      <SlashCommand editor={editor} />
    </div>
  );
}
