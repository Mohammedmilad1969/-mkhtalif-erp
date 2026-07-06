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
import { useProjects, useResearchReports, useCreateStrategicBlueprint } from '@/hooks/useApi';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreateStrategicBlueprintPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: projectsData } = useProjects({ limit: '100' });
  const { data: reportsData } = useResearchReports();
  const createBlueprint = useCreateStrategicBlueprint();
  const projects = projectsData?.data || [];
  const reports = reportsData?.data || [];

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [reportId, setReportId] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [objectives, setObjectives] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) return;
    setSubmitting(true);
    try {
      await createBlueprint.mutateAsync({
        title,
        projectId,
        reportId: reportId || undefined,
        executiveSummary: executiveSummary || undefined,
        objectives: objectives || undefined,
      });
      toast({ title: 'Blueprint created', description: 'Strategic blueprint has been created' });
      router.push('/strategy');
    } catch {
      toast({ title: 'Error', description: 'Failed to create blueprint', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Strategic Blueprint</h1>
          <p className="text-sm text-muted-foreground">Create a strategic blueprint based on research</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Blueprint Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blueprint title" required />
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
              <Label>Research Report (optional)</Label>
              <Select value={reportId} onValueChange={setReportId}>
                <SelectTrigger><SelectValue placeholder="Select report" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {reports.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Executive Summary</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Executive summary..."
              />
            </div>
            <div className="space-y-2">
              <Label>Objectives</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Strategic objectives..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/strategy')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title || !projectId}>
            <Save className="mr-2 h-4 w-4" /> {submitting ? 'Creating...' : 'Create Blueprint'}
          </Button>
        </div>
      </form>
    </div>
  );
}
