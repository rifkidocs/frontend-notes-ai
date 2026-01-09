'use client';

import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { Editor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { getPosFromLineCh, LineCh } from '@/lib/tiptap/cursor-conversion';

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
  position: LineCh;
  userName: string;
  color: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function RemoteCursor({ editor, position, userName, color, containerRef }: RemoteCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateCursorPosition();
  }, [position, editor]); // Update when position or editor changes

  const updateCursorPosition = () => {
    if (!cursorRef.current || !editor || !editor.view || !containerRef.current) return;

    try {
        // Convert line/ch to linear position
        const pos = getPosFromLineCh(editor.state.doc, position);
        
        const coords = editor.view.coordsAtPos(pos);
        
        // Get container rect to calculate relative position
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollTop = containerRef.current.scrollTop;
        const scrollLeft = containerRef.current.scrollLeft;
        
        // Calculate relative position to the container
        // We need to convert viewport coordinates (coords) to container-relative coordinates.
        // Container-relative Y = (Viewport Y - Container Viewport Y) + Container Scroll Top
        const top = coords.top - containerRect.top + scrollTop;
        const left = coords.left - containerRect.left + scrollLeft;
        
        if (isNaN(top) || isNaN(left)) {
            // Console warn removed to avoid spam
            return;
        }
        
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
