'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects, useCreateCampaign } from '@/hooks/useApi';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: projectsData, isLoading } = useProjects({ limit: '100' });
  const createCampaign = useCreateCampaign();
  const projects = projectsData?.data || [];

  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [channels, setChannels] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !projectId) return;
    setSubmitting(true);
    try {
      await createCampaign.mutateAsync({
        name,
        projectId,
        objective: objective || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        channels: channels ? channels.split(',').map(c => c.trim()) : undefined,
      });
      toast({ title: 'Campaign created', description: 'Your campaign has been created successfully' });
      router.push('/campaigns');
    } catch {
      toast({ title: 'Error', description: 'Failed to create campaign', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">Launch a new marketing campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Campaign name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Objective</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Campaign objective..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Channels (comma-separated)</Label>
              <Input
                placeholder="e.g. Facebook, Instagram, Google Ads"
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/campaigns')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !name || !projectId}>
            {submitting ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
