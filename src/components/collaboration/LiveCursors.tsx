'use client';

import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { Editor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

interface LiveCursorsProps {
  editor: Editor | null;
}

export function LiveCursors({ editor }: LiveCursorsProps) {
  const { cursors } = useCollaborationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get cursor positions for rendering
  const cursorEntries = Array.from(cursors.entries());

  if (cursorEntries.length === 0 || !editor) {
    return null;
  }

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {cursorEntries.map(([userId, cursorInfo]) => (
        <RemoteCursor
          key={userId}
          editor={editor}
          userId={userId}
          position={cursorInfo.position}
          userName={cursorInfo.user.name}
          color={cursorInfo.color}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

interface RemoteCursorProps {
  editor: Editor;
  userId: string;
  position: { from: number; to: number };
  userName: string;
  color: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

function RemoteCursor({ editor, position, userName, color, containerRef }: RemoteCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateCursorPosition();
  }, [position, editor]); // Update when position or editor changes

  const updateCursorPosition = () => {
    if (!cursorRef.current || !editor || !editor.view || !containerRef.current) return;

    try {
        // use view.coordsAtPos to get coordinates
        // We use 'from' position for the cursor
        const { from } = position;
        
        // Ensure position is within bounds
        const safePos = Math.min(Math.max(0, from), editor.state.doc.content.size);
        
        const coords = editor.view.coordsAtPos(safePos);
        
        // Get container rect to calculate relative position
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate relative position to the container
        const top = coords.top - containerRect.top;
        const left = coords.left - containerRect.left;
        
        cursorRef.current.style.transform = `translate(${left}px, ${top}px)`;
        
    } catch (e) {
        console.warn("Failed to update cursor position", e);
    }
  };

  return (
    <div
      ref={cursorRef}
      className="absolute transition-transform duration-100 ease-out will-change-transform z-20 pointer-events-none"
      style={{
        left: 0,
        top: 0,
      }}
    >
      {/* Cursor */}
      <svg
        width="2"
        height="20"
        viewBox="0 0 2 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-1"
      >
        <rect width="2" height="20" fill={color} />
      </svg>
      
      {/* Top marker (caret) */}
      <div 
        className="absolute -top-6 -left-2 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap z-40"
        style={{
          backgroundColor: color,
        }}
      >
        {userName}
      </div>
    </div>
  );
}
