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
import { useProjects, useStrategicBlueprints, useCreateCreativeBrief } from '@/hooks/useApi';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreateCreativeBriefPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: projectsData } = useProjects({ limit: '100' });
  const { data: blueprintsData } = useStrategicBlueprints();
  const createBrief = useCreateCreativeBrief();
  const projects = projectsData?.data || [];
  const blueprints = blueprintsData?.data || [];

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [blueprintId, setBlueprintId] = useState('');
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;
    setSubmitting(true);
    try {
      await createBrief.mutateAsync({
        title,
        projectId,
        blueprintId: blueprintId || undefined,
        overview: overview || undefined,
        objectives: objectives || undefined,
      });
      toast({ title: 'Brief created', description: 'Creative brief has been created' });
      router.push('/strategy');
    } catch {
      toast({ title: 'Error', description: 'Failed to create brief', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Creative Brief</h1>
          <p className="text-sm text-muted-foreground">Create a creative brief for a project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Brief Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title" required />
            </div>
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Strategic Blueprint (optional)</Label>
              <Select value={blueprintId} onValueChange={setBlueprintId}>
                <SelectTrigger><SelectValue placeholder="Select blueprint" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {blueprints.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Overview</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Brief overview..."
              />
            </div>
            <div className="space-y-2">
              <Label>Objectives</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Creative objectives..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/strategy')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title || !projectId}>
            <Save className="mr-2 h-4 w-4" /> {submitting ? 'Creating...' : 'Create Brief'}
          </Button>
        </div>
      </form>
    </div>
  );
}
