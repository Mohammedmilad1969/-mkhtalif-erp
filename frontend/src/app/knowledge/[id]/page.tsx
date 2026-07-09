'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useKnowledgeArticle } from '@/hooks/useApi';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const typeVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success'> = {
  sop: 'default',
  checklist: 'secondary',
  template: 'info',
  guide: 'success',
  faq: 'outline',
  case_study: 'default',
  script: 'info',
  filter_question: 'secondary',
};

const typeLabels: Record<string, string> = {
  sop: 'SOP',
  checklist: 'Checklist',
  template: 'Template',
  guide: 'Guide',
  faq: 'FAQ',
  case_study: 'Case Study',
  script: 'Script',
  filter_question: 'Filter Question',
};

export default function KnowledgeArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: article, isLoading, error } = useKnowledgeArticle(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load article</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/knowledge')}>Back to Knowledge Base</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/knowledge')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <Badge variant={typeVariants[article.articleType] || 'secondary'}>
              {typeLabels[article.articleType]}
            </Badge>
            <Badge variant={article.status === 'published' ? 'success' : article.status === 'archived' ? 'outline' : 'secondary'}>
              {article.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {article.departmentId && (
              <span className="capitalize">{article.departmentId}</span>
            )}
            {article.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {article.author.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {new Date(article.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {article.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {article.articleType === 'script' ? (
            (() => {
              let rows: { text: string; customerType: string }[] = [];
              try {
                rows = JSON.parse(article.content || '[]');
              } catch { /* ignore */ }
              if (!Array.isArray(rows)) rows = [];
              return rows.length === 0 ? (
                <p className="text-muted-foreground">No script content available</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium w-1/2">Script Text</th>
                        <th className="text-left p-3 font-medium w-1/2">Customer Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-3 whitespace-pre-wrap">{row.text}</td>
                          <td className="p-3">{row.customerType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {article.content || 'No content available'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
