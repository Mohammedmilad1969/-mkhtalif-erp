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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import {
  CalendarDays, Plus, Clock, MapPin, Video, User, Link,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', currentMonth.toISOString()],
    queryFn: () => get('/calendar', {
      startDate: calStart.toISOString(),
      endDate: calEnd.toISOString(),
      limit: 200,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => post('/calendar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      setCreateOpen(false);
    },
  });

  const events: any[] = (data as any)?.data || [];

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((e: any) => {
      const start = parseISO(e.startTime);
      return isSameDay(start, date);
    });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage events</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <EventForm onSubmit={(data) => createMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((date) => {
              const dayEvents = getEventsForDay(date);
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              return (
                <div
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`bg-background min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !isSameMonth(date, currentMonth) ? 'opacity-40' : ''
                  } ${isSelected ? 'ring-2 ring-primary' : ''} ${isToday ? 'bg-primary/5' : ''}`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-primary' : ''} ${isSelected ? 'text-primary' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((e: any) => (
                      <div
                        key={e.id}
                        className="text-[10px] px-1 py-0.5 rounded truncate font-medium"
                        style={{ backgroundColor: e.color || '#3b82f6', color: '#fff' }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayEvents = getEventsForDay(selectedDate);
              if (dayEvents.length === 0) {
                return <p className="text-sm text-muted-foreground">No events on this day</p>;
              }
              return (
                <div className="space-y-2">
                  {dayEvents.map((e: any) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color || '#3b82f6' }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{e.title}</p>
                        {e.description && (
                          <p className="text-xs text-muted-foreground">{e.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(e.startTime), 'h:mm a')}
                            {e.endTime ? ` - ${format(parseISO(e.endTime), 'h:mm a')}` : ''}
                          </span>
                          {e.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {e.location}
                            </span>
                          )}
                          {e.owner && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {e.owner.firstName} {e.owner.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EventForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'meeting',
    startTime: '',
    endTime: '',
    allDay: false,
    location: '',
    meetingUrl: '',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title *</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Color</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-10 rounded border cursor-pointer"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Start *</label>
          <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">End</label>
          <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Location</label>
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Room or address" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Meeting URL</label>
        <Input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://meet.google.com/..." />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
      <Button type="submit" className="w-full">Create Event</Button>
    </form>
  );
}
