'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Share2, Link as LinkIcon, Copy, Check, Loader2, Trash2, Mail } from 'lucide-react';
import { sharingApi } from '@/lib/api/sharing';
import { SharingSettings, SharedAccess } from '@/lib/types';
import { toast } from 'sonner';
import { useNotesStore } from '@/lib/stores/notes-store';

interface ShareModalProps {
  noteId: string;
  noteTitle: string;
  trigger?: React.ReactNode;
}

export function ShareModal({ noteId, noteTitle, trigger }: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SharingSettings | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [accessLevel, setAccessLevel] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [copied, setCopied] = useState(false);

  // Fetch sharing settings when modal opens
  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open, noteId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await sharingApi.getSettings(noteId);
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load sharing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    setSaving(true);
    try {
      if (checked) {
        await sharingApi.makePublic(noteId, settings?.publicAccess || 'VIEW');
      } else {
        await sharingApi.removePublic(noteId);
      }
      await fetchSettings();
      toast.success(checked ? 'Note is now public' : 'Public access removed');
    } catch (error) {
      toast.error('Failed to update public access');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePublicAccess = async (accessLevel: 'VIEW' | 'EDIT') => {
    setSaving(true);
    try {
      await sharingApi.makePublic(noteId, accessLevel);
      await fetchSettings();
      toast.success('Public access updated');
    } catch (error) {
      toast.error('Failed to update public access');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteUser = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSaving(true);
    try {
      await sharingApi.inviteUser(noteId, { email: emailInput, accessLevel });
      setEmailInput('');
      await fetchSettings();
      toast.success('Invitation sent');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveUser = async (accessId: string) => {
    setSaving(true);
    try {
      await sharingApi.removeUser(noteId, accessId);
      await fetchSettings();
      toast.success('Access removed');
    } catch (error) {
      toast.error('Failed to remove access');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccess = async (accessId: string, newLevel: 'VIEW' | 'EDIT') => {
    setSaving(true);
    try {
      await sharingApi.updateAccess(noteId, accessId, newLevel);
      await fetchSettings();
      toast.success('Access updated');
    } catch (error) {
      toast.error('Failed to update access');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/shared/${noteId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  const getUserInitials = (name: string | null, email: string | null): string => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || '?';
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Share2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &quot;{noteTitle}&quot;</DialogTitle>
          <DialogDescription>
            Manage who can access and edit this note
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Public Access */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="public-toggle" className="font-normal">
                    Public access
                  </Label>
                </div>
                <Switch
                  id="public-toggle"
                  checked={settings?.isPublic || false}
                  onCheckedChange={handleTogglePublic}
                  disabled={saving}
                />
              </div>

              {settings?.isPublic && (
                <div className="ml-6 space-y-2">
                  <Select
                    value={settings.publicAccess || 'VIEW'}
                    onValueChange={(v) => handleUpdatePublicAccess(v as 'VIEW' | 'EDIT')}
                    disabled={saving}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEW">Anyone with link can view</SelectItem>
                      <SelectItem value="EDIT">Anyone with link can edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Copy link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Invite by Email */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Invite people</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInviteUser()}
                  disabled={saving}
                  className="flex-1"
                />
                <Select
                  value={accessLevel}
                  onValueChange={(v) => setAccessLevel(v as 'VIEW' | 'EDIT')}
                  disabled={saving}
                >
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEW">Can view</SelectItem>
                    <SelectItem value="EDIT">Can edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleInviteUser}
                  disabled={saving || !emailInput.trim()}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Shared Users */}
            {settings && settings.sharedAccess.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  People with access ({settings.sharedAccess.length})
                </Label>
                <div className="space-y-2">
                  {settings.sharedAccess.map((access) => (
                    <div
                      key={access.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(access.user?.name || null, access.inviteEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {access.user?.name || access.inviteEmail || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {access.user?.email || access.inviteEmail}
                        </p>
                      </div>
                      <Select
                        value={access.accessLevel}
                        onValueChange={(v) => handleUpdateAccess(access.id, v as 'VIEW' | 'EDIT')}
                        disabled={saving}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIEW">Can view</SelectItem>
                          <SelectItem value="EDIT">Can edit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveUser(access.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {saving && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
