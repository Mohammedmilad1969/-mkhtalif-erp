'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCreateCalendarEvent } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage } from '@/lib/api';
import { CalendarPlus, Loader2 } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'task', label: 'Task' },
];

const COLOR_OPTIONS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

interface CreateEventDialogProps {
  leadId?: string;
  clientId?: string;
  children?: React.ReactNode;
}

export function CreateEventDialog({ leadId, clientId, children }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createEvent = useCreateCalendarEvent();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('meeting');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setEventType('meeting');
    setStartTime('');
    setEndTime('');
    setAllDay(false);
    setLocation('');
    setMeetingUrl('');
    setColor('#3b82f6');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !startTime) return;
    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        eventType,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        allDay,
        location: location || undefined,
        meetingUrl: meetingUrl || undefined,
        color,
        description: description || undefined,
        leadId,
        clientId,
      });
      resetForm();
      setOpen(false);
      toast({ title: 'Success', description: 'Event created' });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to create event'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <CalendarPlus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>Add a new event to the calendar</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="event-title">Title *</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start *</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="event-allday">All Day</Label>
            <Switch id="event-allday" checked={allDay} onCheckedChange={setAllDay} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room, address or virtual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-url">Meeting URL</Label>
            <Input
              id="event-url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-desc">Description</Label>
            <textarea
              id="event-desc"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !startTime || createEvent.isPending}>
            {createEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
