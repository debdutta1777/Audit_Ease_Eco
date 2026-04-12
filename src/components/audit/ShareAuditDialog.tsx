import { useState, useEffect } from 'react';
import { Share2, Copy, Check, UserPlus, Trash2, Mail } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ShareAuditDialogProps {
  auditId: string;
  auditName: string;
}

interface AuditShare {
  id: string;
  shared_with_email: string;
  permission_level: string;
  share_token: string;
  accepted_at: string | null;
  created_at: string;
}

export function ShareAuditDialog({ auditId, auditName }: ShareAuditDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [shares, setShares] = useState<AuditShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fetchShares();
    }
  }, [open, auditId]);

  const fetchShares = async () => {
    const { data } = await supabase
      .from('audit_shares')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false });
    
    if (data) setShares(data);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user exists with this email
      const { data: existingShare } = await supabase
        .from('audit_shares')
        .select('id')
        .eq('audit_id', auditId)
        .eq('shared_with_email', email.toLowerCase())
        .single();

      if (existingShare) {
        toast.error('This email has already been invited');
        return;
      }

      const { error } = await supabase
        .from('audit_shares')
        .insert({
          audit_id: auditId,
          shared_with_email: email.toLowerCase(),
          permission_level: permission,
          invited_by: user.id,
        });

      if (error) throw error;

      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      fetchShares();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    const { error } = await supabase
      .from('audit_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      toast.error('Failed to remove access');
    } else {
      toast.success('Access removed');
      fetchShares();
    }
  };

  const copyShareLink = async (shareToken: string) => {
    const link = `${window.location.origin}/audit/${auditId}?token=${shareToken}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Audit</DialogTitle>
          <DialogDescription>
            Invite team members to collaborate on "{auditName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite by email */}
          <div className="space-y-3">
            <Label>Invite by email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <Select value={permission} onValueChange={(v: 'view' | 'edit') => setPermission(v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={loading} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>

          {/* Current shares */}
          {shares.length > 0 && (
            <div className="space-y-3">
              <Label>People with access</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{share.shared_with_email}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {share.permission_level}
                          </Badge>
                          {share.accepted_at ? (
                            <span className="text-xs text-green-600">Accepted</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyShareLink(share.share_token)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveShare(share.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick copy link */}
          {shares.length > 0 && (
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => shares[0] && copyShareLink(shares[0].share_token)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
