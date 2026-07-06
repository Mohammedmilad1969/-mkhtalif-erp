'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCommunicationLogs, useCreateCommunicationLog } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage } from '@/lib/api';
import {
  Plus,
  Send,
  Loader2,
  Mail,
  MessageSquare,
  MessageSquareText,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';

interface CommunicationsTabProps {
  leadId?: string;
  clientId?: string;
}

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  call: PhoneCall,
  internal_note: MessageSquareText,
};

const channelColors: Record<string, string> = {
  email: 'text-blue-500',
  sms: 'text-green-500',
  whatsapp: 'text-emerald-500',
  call: 'text-purple-500',
  internal_note: 'text-amber-500',
};

export function CommunicationsTab({ leadId, clientId }: CommunicationsTabProps) {
  const { toast } = useToast();
  const entityType = leadId ? 'lead' : 'client';
  const entityId = leadId || clientId || '';
  const { data: communications, isLoading, error: commError } = useCommunicationLogs(entityId, entityType as 'lead' | 'client');
  const createComm = useCreateCommunicationLog();
  const [showCreate, setShowCreate] = useState(false);
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp' | 'call' | 'internal_note'>('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [toAddress, setToAddress] = useState('');

  const handleCreate = async () => {
    if (!body.trim()) return;
    try {
      const payload: any = {
        channel,
        direction: 'outbound',
        subject: subject || undefined,
        body,
        toAddress: toAddress || undefined,
      };
      if (leadId) payload.leadId = leadId;
      if (clientId) payload.clientId = clientId;

      await createComm.mutateAsync(payload);
      setShowCreate(false);
      setSubject('');
      setBody('');
      setToAddress('');
      setChannel('email');
      toast({ title: 'Success', description: 'Communication logged' });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to log communication'), variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  if (commError) return <p className="text-center text-destructive py-8">Failed to load communications</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Communications</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" /> Create
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreate && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <h4 className="text-sm font-medium">Log Communication</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['email', 'sms', 'whatsapp', 'call', 'internal_note'] as const).map((ch) => (
                      <SelectItem key={ch} value={ch} className="capitalize">{ch.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder={channel === 'email' ? 'email@example.com' : '+1234567890'} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Description"
              />
            </div>
            <Button onClick={handleCreate} disabled={createComm.isPending || !body.trim()}>
              {createComm.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              <Send className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        )}

        {communications && communications.length > 0 ? (
          <div className="space-y-3">
            {communications.map((comm) => {
              const Icon = channelIcons[comm.channel] || MessageSquare;
              return (
                <div key={comm.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50">
                  <div className={`mt-0.5 ${channelColors[comm.channel] || 'text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium capitalize">{comm.channel.replace('_', ' ')}</span>
                      <Badge variant={comm.direction === 'inbound' ? 'secondary' : 'outline'} className="text-[10px]">
                        {comm.direction}
                      </Badge>
                      {comm.subject && <span className="text-sm font-medium truncate">{comm.subject}</span>}
                    </div>
                    {comm.body && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comm.body}</p>}
                    {comm.toAddress && <p className="text-xs text-muted-foreground mt-1">To: {comm.toAddress}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {comm.createdBy?.name || 'System'} &middot; {new Date(comm.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !showCreate && <p className="text-center text-muted-foreground py-8">No communications found</p>
        )}
      </CardContent>
    </Card>
  );
}
