'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { NoteContent } from '@/lib/types';
import { getExtensions } from '@/lib/tiptap/extensions';
import { apiToTipTap, tipTapToApi } from '@/lib/tiptap/schema-matcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { aiApi } from '@/lib/api/ai';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDocumentSync } from '@/lib/websocket/document-sync';
import { useCursorTracking } from '@/lib/websocket/cursor-tracking';
import { LiveCursors } from '@/components/collaboration/LiveCursors';

interface EditorProps {
  content: NoteContent;
  editable?: boolean;
  placeholder?: string;
  onChange?: (content: NoteContent) => void;
  onReady?: () => void;
  noteId?: string;
}

export function Editor({
  content,
  editable = true,
  placeholder = "Start writing...",
  onChange,
  onReady,
  noteId,
}: EditorProps) {
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingCommand, setLoadingCommand] = useState<string | null>(null);

  const editor = useEditor({
    extensions: getExtensions({ placeholder, editable }),
    content: apiToTipTap(content),
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON();
        const apiContent = tipTapToApi(json);
        onChange(apiContent);
      }
    },
    onCreate: () => {
      onReady?.();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[50vh] p-4 max-w-none',
      },
    },
  });

  // Collaboration hooks integration
  const isCollabEnabled = !!(noteId && noteId !== 'new');

  // Memoize the sync instances to avoid recreation on every render
  const documentSync = useMemo(() => {
    if (isCollabEnabled && editor) {
      return useDocumentSync(noteId!, editor);
    }
    return null;
  }, [isCollabEnabled, noteId, editor]);

  const cursorTracker = useMemo(() => {
    if (isCollabEnabled && editor) {
      return useCursorTracking(noteId!, editor);
    }
    return null;
  }, [isCollabEnabled, noteId, editor]);

  // Manage lifecycle of collaboration
  useEffect(() => {
    if (documentSync) documentSync.join();
    if (cursorTracker) cursorTracker.start();

    return () => {
      documentSync?.leave();
      cursorTracker?.stop();
    };
  }, [documentSync, cursorTracker]);

  // Handle external updates
  useEffect(() => {
    if (!editor) return;

    // If the editor is focused, we assume the user is typing and we shouldn't 
    // overwrite their work with external updates (unless we implement CRDT/Yjs properly later).
    // However, if we DO update, we should try to preserve cursor.
    if (editor.isFocused) return;

    // Convert API content to Tiptap JSON
    const newContent = apiToTipTap(content);
    
    // Compare current content to avoid unnecessary updates
    const currentContent = editor.getJSON();
    
    // We only update if there's a meaningful difference.
    // Note: This is a simplified check. Ideally, we'd use Yjs for real sync.
    if (JSON.stringify(newContent) !== JSON.stringify(currentContent)) {
       // Save cursor position if possible
       const { from, to } = editor.state.selection;
       
       editor.commands.setContent(newContent);
       
       // Restore cursor position
       const newSize = editor.state.doc.content.size;
       const safeFrom = Math.min(from, newSize);
       const safeTo = Math.min(to, newSize);
       
       if (editor.isFocused) {
           editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
       }
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  const runAiCommand = async (command: 'fixGrammar' | 'summarize' | 'continueWriting' | 'generateBlog') => {
    if (!editor) return;
    
    setIsAiLoading(true);
    setLoadingCommand(command);
    try {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        const fullText = editor.getText();
        const textToProcess = selectedText || fullText;

        if (!textToProcess.trim()) {
            toast.error("Please write or select some text first.");
            return;
        }

        const response = await aiApi.executeAction(command, textToProcess, fullText);
        
        let result = '';
        if (command === 'fixGrammar') result = response.correctedText || '';
        if (command === 'summarize') result = response.summary || '';
        if (command === 'continueWriting') result = response.continuation || '';
        if (command === 'generateBlog') result = response.content || '';

        if (result) {
            if (selectedText) {
                // Replace selection
                editor.commands.insertContent(result);
            } else {
                // Append
                editor.commands.insertContentAt(editor.state.doc.content.size, `\n${result}`);
            }
            toast.success("AI finished!");
        }
    } catch (e) {
        console.error(e);
        toast.error("Failed to run AI command");
    } finally {
        setIsAiLoading(false);
        setLoadingCommand(null);
        setShowAIDialog(false);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-muted/10 rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border w-full">
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap sticky top-0 z-10 w-full">
           <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-muted' : ''}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
            onClick={() => setShowAIDialog(true)}
          >
            <Sparkles className="h-4 w-4" />
            AI Actions
          </Button>
        </div>
      )}

      <div className="relative flex-1 w-full overflow-y-auto">
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex gap-1 p-1 overflow-hidden rounded-lg border bg-background shadow-xl items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runAiCommand('fixGrammar')}
              disabled={isAiLoading}
              className="h-8 gap-1.5 px-2 text-xs font-medium hover:bg-muted"
            >
              {loadingCommand === 'fixGrammar' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              )}
              Fix Grammar
            </Button>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runAiCommand('summarize')}
              disabled={isAiLoading}
              className="h-8 px-2 text-xs font-medium hover:bg-muted gap-1.5"
            >
              {loadingCommand === 'summarize' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Summarize
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runAiCommand('continueWriting')}
              disabled={isAiLoading}
              className="h-8 px-2 text-xs font-medium hover:bg-muted gap-1.5"
            >
              {loadingCommand === 'continueWriting' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Continue
            </Button>
          </BubbleMenu>
        )}
        {isCollabEnabled && <LiveCursors editor={editor} />}
        <EditorContent editor={editor} className="flex-1 w-full h-full" />
      </div>

      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Assistant</DialogTitle>
            <DialogDescription>
              Choose an AI action to perform on your note content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => runAiCommand('fixGrammar')} disabled={isAiLoading}>
                   Fix Grammar
                </Button>
                <Button variant="outline" onClick={() => runAiCommand('summarize')} disabled={isAiLoading}>
                   Summarize
                </Button>
                <Button variant="outline" onClick={() => runAiCommand('continueWriting')} disabled={isAiLoading}>
                   Continue Writing
                </Button>
                <Button variant="outline" onClick={() => runAiCommand('generateBlog')} disabled={isAiLoading}>
                   Generate Blog Post
                </Button>
             </div>
             {isAiLoading && (
                 <div className="flex items-center justify-center gap-2 text-muted-foreground">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Processing...
                 </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}