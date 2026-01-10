'use client';

import { useCollaborationStore } from '@/lib/stores/collaboration-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface PresenceIndicatorProps {
  compact?: boolean;
}

export function PresenceIndicator({ compact = false }: PresenceIndicatorProps) {
  const { users, isConnected } = useCollaborationStore();
  const { user } = useAuthStore();

  // Get other users and filter out invalid ones
  const otherUsers = users.filter((u) =>
    u.userId !== user?.id &&
    u.userId &&
    u.userName &&
    u.socketId
  );

  if (!isConnected || otherUsers.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>{otherUsers.length} viewing</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center gap-1">
        {otherUsers.slice(0, 3).map((collabUser) => (
          <Avatar
            key={`${collabUser.userId}-${collabUser.socketId}`}
            className="h-5 w-5 border border-background cursor-pointer hover:scale-110 transition-transform"
            title={`${collabUser.userName} is viewing`}
          >
            <AvatarFallback
              style={{
                backgroundColor: collabUser.color,
                color: 'white',
                fontSize: '10px',
              }}
            >
              {getUserInitials(collabUser.userName)}
            </AvatarFallback>
          </Avatar>
        ))}
        {otherUsers.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{otherUsers.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}

function getUserInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
