'use client';

import { useEffect, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { aiApi } from '@/lib/api/ai';
import { AIPrompt } from '@/lib/types';
import { Sparkles, ArrowRight, FileText, Search, Expand, Newspaper, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AIContextMenuProps {
  editor: Editor | null;
}

const AI_OPTIONS: Array<{
  id: AIPrompt;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'fixGrammar',
    label: 'Fix Grammar',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Correct grammar and spelling',
  },
  {
    id: 'continueWriting',
    label: 'Continue Writing',
    icon: <ArrowRight className="h-4 w-4" />,
    description: 'Generate continuation',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: <FileText className="h-4 w-4" />,
    description: 'Create a summary',
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: <Expand className="h-4 w-4" />,
    description: 'Elaborate on the topic',
  },
  {
    id: 'generateBlog',
    label: 'Generate Blog Post',
    icon: <Newspaper className="h-4 w-4" />,
    description: 'Create a full blog post',
  },
  {
    id: 'generateOutline',
    label: 'Generate Outline',
    icon: <ListTodo className="h-4 w-4" />,
    description: 'Create document outline',
  },
];

export function AIContextMenu({ editor }: AIContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Detect text selection
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { from, to, empty } = editor.state.selection;

      if (!empty && from !== to) {
        const text = editor.state.doc.textBetween(from, to);
        if (text.trim().length > 0) {
          setSelectedText(text);
          setSelectedRange({ from, to });

          // Get coordinates for positioning
          try {
            const coords = editor.view.coordsAtPos(from);
            setPosition({
              x: coords.left,
              y: coords.bottom + 10,
            });
            setIsVisible(true);
          } catch {
            // Fallback position if coordsAtPos fails
            setIsVisible(false);
          }
        }
      } else {
        setIsVisible(false);
        setSelectedText('');
        setSelectedRange(null);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // Handle AI action selection
  const handleAIAction = useCallback(
    async (action: AIPrompt) => {
      if (!editor || !selectedText || !selectedRange) return;

      setIsLoading(true);
      setIsVisible(false);

      try {
        const response = await aiApi.executeAction(action, selectedText, selectedText);
        let result = '';

        // Extract the appropriate result based on action type
        switch (action) {
          case 'fixGrammar':
            result = response.correctedText || '';
            // Replace selected text
            editor
              .chain()
              .focus()
              .deleteRange({ from: selectedRange.from, to: selectedRange.to })
              .insertContent(result)
              .run();
            toast.success('Grammar fixed!');
            break;

          case 'continueWriting':
            result = response.continuation || '';
            // Insert after selection
            editor.chain().focus().insertContentAt(selectedRange.to, result).run();
            toast.success('Content generated!');
            break;

          case 'summarize':
            result = response.summary || '';
            // Replace selected text with summary
            editor
              .chain()
              .focus()
              .deleteRange({ from: selectedRange.from, to: selectedRange.to })
              .insertContent(result)
              .run();
            toast.success('Summary created!');
            break;

          case 'expand':
            result = response.expansion || '';
            editor
              .chain()
              .focus()
              .deleteRange({ from: selectedRange.from, to: selectedRange.to })
              .insertContent(result)
              .run();
            toast.success('Content expanded!');
            break;

          case 'generateBlog':
            result = response.content || '';
            editor
              .chain()
              .focus()
              .deleteRange({ from: selectedRange.from, to: selectedRange.to })
              .insertContent(result)
              .run();
            toast.success('Blog post generated!');
            break;

          case 'generateOutline':
            result = response.outline || '';
            editor
              .chain()
              .focus()
              .deleteRange({ from: selectedRange.from, to: selectedRange.to })
              .insertContent(result)
              .run();
            toast.success('Outline created!');
            break;
        }
      } catch (error) {
        console.error('AI action failed:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to process AI request'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [editor, selectedText, selectedRange]
  );

  if (!isVisible) {
    // Show loading indicator
    return isLoading ? (
      <div className="fixed top-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-right">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="text-sm">
          <p className="font-medium">AI is working...</p>
          <p className="text-muted-foreground text-xs">This may take a moment</p>
        </div>
      </div>
    ) : null;
  }

  return (
    <>
      {/* Backdrop to close menu */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsVisible(false)}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-background/50 flex items-center justify-center">
          <div className="bg-background border rounded-lg shadow-lg p-6 flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>
              <p className="font-medium">AI is working...</p>
              <p className="text-muted-foreground text-sm">This may take a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Context Menu */}
      <div
        className="fixed z-50 bg-background border rounded-lg shadow-lg p-2 min-w-[220px] animate-in fade-in zoom-in-95"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        <div className="text-xs text-muted-foreground px-2 py-1.5 mb-1 font-medium">
          AI Actions
        </div>

        <div className="space-y-0.5">
          {AI_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAIAction(option.id)}
              className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md flex items-start gap-2 transition-colors"
            >
              <div className="mt-0.5 text-primary">{option.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{option.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
