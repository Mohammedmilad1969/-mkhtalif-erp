'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useResearchReport } from '@/hooks/useApi';
import { ArrowLeft, Edit, FileText } from 'lucide-react';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success'> = {
  draft: 'secondary',
  in_review: 'default',
  completed: 'success',
  archived: 'outline',
};

export default function ResearchReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: report, isLoading, error } = useResearchReport(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-24 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Report not found</h2>
        <p className="text-muted-foreground mb-4">The research report could not be loaded.</p>
        <Button onClick={() => router.push('/strategy')}>Back to Strategy</Button>
      </div>
    );
  }

  const swot = report.swot || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/strategy')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <Badge variant={statusVariants[report.status] || 'secondary'} className="capitalize">
                {report.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.project?.name} &middot; Created {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/strategy/reports/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {report.businessAnalysis && (
          <SectionCard title="Business Analysis">
            <p className="text-sm whitespace-pre-wrap">{report.businessAnalysis}</p>
          </SectionCard>
        )}
        {report.socialAnalysis && (
          <SectionCard title="Social Analysis">
            <p className="text-sm whitespace-pre-wrap">{report.socialAnalysis}</p>
          </SectionCard>
        )}
        {report.marketAnalysis && (
          <SectionCard title="Market Analysis">
            <p className="text-sm whitespace-pre-wrap">{report.marketAnalysis}</p>
          </SectionCard>
        )}
        {report.competitorAnalysis && (
          <SectionCard title="Competitor Analysis">
            <p className="text-sm whitespace-pre-wrap">{report.competitorAnalysis}</p>
          </SectionCard>
        )}
        {report.audienceAnalysis && (
          <SectionCard title="Audience Analysis">
            <p className="text-sm whitespace-pre-wrap">{report.audienceAnalysis}</p>
          </SectionCard>
        )}
      </div>

      {(swot.strengths || swot.weaknesses || swot.opportunities || swot.threats) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SwotBox title="Strengths" items={swot.strengths} variant="success" />
              <SwotBox title="Weaknesses" items={swot.weaknesses} variant="destructive" />
              <SwotBox title="Opportunities" items={swot.opportunities} variant="info" />
              <SwotBox title="Threats" items={swot.threats} variant="warning" />
            </div>
          </CardContent>
        </Card>
      )}

      {report.keyFindings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{report.keyFindings}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SwotBox({ title, items, variant }: { title: string; items?: string[]; variant: 'success' | 'destructive' | 'info' | 'warning' }) {
  const borderColors = {
    success: 'border-l-green-500',
    destructive: 'border-l-red-500',
    info: 'border-l-blue-500',
    warning: 'border-l-yellow-500',
  };

  return (
    <div className={`border-l-4 ${borderColors[variant]} bg-muted/30 rounded-r-lg p-4`}>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      {items && items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-muted-foreground">&bull; {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">None specified</p>
      )}
    </div>
  );
}
