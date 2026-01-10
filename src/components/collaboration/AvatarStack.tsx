'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { useAuthStore } from '@/lib/stores/auth-store';

interface AvatarStackProps {
  maxVisible?: number;
  showPresence?: boolean;
}

export function AvatarStack({ maxVisible = 3, showPresence = true }: AvatarStackProps) {
  const { users, myColor } = useCollaborationStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center -space-x-2 h-8" />;
  }

  // Get unique users (exclude current user) and filter out invalid ones
  const otherUsers = users.filter((u) => {
    // Check both userId and current user ID
    const isSelf = u.userId === user?.id;
    const isValid = !!(u.userId && u.userName);
    return !isSelf && isValid;
  });

  // Get users to display
  const visibleUsers = otherUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, otherUsers.length - maxVisible);

  return (
    <div className="flex items-center -space-x-2">
      {/* Current user */}
      <div className="relative" title={`You (${user?.name || 'Guest'})`}>
        <Avatar 
          className="h-8 w-8 border-2"
          style={{ borderColor: myColor }}
        >
          <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'You'} />
          <AvatarFallback style={{ backgroundColor: myColor, color: 'white' }}>
            {getUserInitials(user?.name || 'You')}
          </AvatarFallback>
        </Avatar>
        {showPresence && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      {/* Other users */}
      {visibleUsers.map((collabUser) => (
        <div key={`${collabUser.userId}-${collabUser.socketId}`} className="relative cursor-pointer hover:scale-110 transition-transform" title={`${collabUser.userName} is viewing`}>
          <Avatar
            className="h-8 w-8 border-2 border-background"
            style={{ borderColor: collabUser.color }}
          >
            <AvatarImage src={undefined} alt={collabUser.userName} />
            <AvatarFallback style={{ backgroundColor: collabUser.color, color: 'white' }}>
              {getUserInitials(collabUser.userName)}
            </AvatarFallback>
          </Avatar>
          {showPresence && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
      ))}

      {/* Remaining count */}
      {remainingCount > 0 && (
        <div
          className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
          title={`${remainingCount} more viewers`}
        >
          +{remainingCount}
        </div>
      )}

      {/* Empty state label - only if absolutely alone */}
      {otherUsers.length === 0 && (
        <div className="pl-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          Only You
        </div>
      )}
    </div>
  );
}

function getUserInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
