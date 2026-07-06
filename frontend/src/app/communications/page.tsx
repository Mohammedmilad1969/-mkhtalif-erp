'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import {
  MessageSquare, Mail, Phone, MessageCircle, Send, Plus,
  Search, Filter, ArrowUpRight, Clock, User,
} from 'lucide-react';
import { format } from 'date-fns';

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  sms: MessageCircle,
  whatsapp: MessageCircle,
  call: Phone,
  internal_note: MessageSquare,
};

const channelColors: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  call: 'bg-purple-100 text-purple-700',
  internal_note: 'bg-gray-100 text-gray-700',
};

export default function CommunicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['communications', channelFilter, search],
    queryFn: () => get('/communications', {
      ...(channelFilter !== 'all' ? { channel: channelFilter } : {}),
      limit: 50,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => post('/communications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      setCreateOpen(false);
    },
  });

  const logs: any[] = (data as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communications Center</h1>
          <p className="text-sm text-muted-foreground">Log and track all client communications</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Log Communication</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Communication</DialogTitle>
            </DialogHeader>
            <CommunicationForm onSubmit={(data) => createMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="call">Phone Call</SelectItem>
            <SelectItem value="internal_note">Internal Note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading communications...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No communications logged yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log: any) => {
                const Icon = channelIcons[log.channel] || MessageSquare;
                return (
                  <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${channelColors[log.channel] || 'bg-gray-100'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize text-xs">{log.channel?.replace(/_/g, ' ')}</Badge>
                          <Badge variant={log.direction === 'inbound' ? 'default' : 'secondary'} className="text-xs">
                            {log.direction}
                          </Badge>
                          {log.lead?.clientName && (
                            <span className="text-xs text-muted-foreground">{log.lead.clientName}</span>
                          )}
                        </div>
                        {log.subject && (
                          <p className="text-sm font-medium">{log.subject}</p>
                        )}
                        {log.body && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{log.body}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.createdBy?.firstName ? `${log.createdBy.firstName} ${log.createdBy.lastName}` : 'System'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : ''}
                          </span>
                          {log.toAddress && (
                            <span className="truncate">To: {log.toAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommunicationForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    channel: 'email',
    direction: 'outbound',
    subject: '',
    body: '',
    toAddress: '',
    leadId: '',
    clientId: '',
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads-select'],
    queryFn: () => get('/leads', { limit: 100 }),
  });

  const leads: any[] = (leadsData as any)?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Channel</label>
          <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="call">Phone Call</SelectItem>
              <SelectItem value="internal_note">Internal Note</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Direction</label>
          <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Related Lead (optional)</label>
        <Select value={form.leadId} onValueChange={(v) => setForm({ ...form, leadId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select lead..." />
          </SelectTrigger>
          <SelectContent>
            {leads.map((l: any) => (
              <SelectItem key={l.id} value={l.id}>{l.clientName}{l.company ? ` - ${l.company}` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">To</label>
        <Input value={form.toAddress} onChange={(e) => setForm({ ...form, toAddress: e.target.value })} placeholder="email@example.com" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Subject</label>
        <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject..." />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Message</label>
        <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} placeholder="Write your message..." />
      </div>
      <Button type="submit" className="w-full"><Send className="h-4 w-4 mr-2" />Save Communication</Button>
    </form>
  );
}
