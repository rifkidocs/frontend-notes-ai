'use client';

import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { useEffect, useRef } from 'react';

export function LiveCursors() {
  const { cursors } = useCollaborationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Get cursor positions for rendering
  const cursorEntries = Array.from(cursors.entries());

  if (cursorEntries.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-30">
      {cursorEntries.map(([userId, cursorInfo]) => (
        <RemoteCursor
          key={userId}
          userId={userId}
          position={cursorInfo.position}
          userName={cursorInfo.user.name}
          color={cursorInfo.color}
        />
      ))}
    </div>
  );
}

interface RemoteCursorProps {
  userId: string;
  position: { from: number; to: number };
  userName: string;
  color: string;
}

function RemoteCursor({ position, userName, color }: RemoteCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate position based on TipTap coordinates
    // This is a simplified implementation - in production you'd use TipTap's view.coordsAtPos()
    updateCursorPosition();
  }, [position]);

  const updateCursorPosition = () => {
    if (!cursorRef.current) return;

    // Get the selection coordinates
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Try to find the text node at the position
    // This is a placeholder - you'd need to implement proper position calculation
    // using TipTap's view.coordsAtPos() method
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();

    if (rects.length > 0) {
      const rect = rects[0];
      cursorRef.current.style.left = `${rect.left + window.scrollX}px`;
      cursorRef.current.style.top = `${rect.top + window.scrollY}px`;
    }
  };

  return (
    <div
      ref={cursorRef}
      className="absolute transition-all duration-100 ease-out"
      style={{
        transform: 'translate(-2px, 0)',
      }}
    >
      {/* Cursor */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}
      >
        <path
          d="M0.5 0.5L12.5 8L6.5 8L9.5 15.5L6.5 15.5L3.5 8L0.5 8L0.5 0.5Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* Label */}
      <div
        className="absolute left-4 top-0 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{
          backgroundColor: color,
        }}
      >
        {userName}
      </div>
    </div>
  );
}
