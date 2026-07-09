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
import { useCreateKnowledgeArticle } from '@/hooks/useApi';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreateKnowledgeArticlePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createArticle = useCreateKnowledgeArticle();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [articleType, setArticleType] = useState('guide');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [submitting, setSubmitting] = useState(false);
  const [scriptRows, setScriptRows] = useState([{ text: '', customerType: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    try {
      await createArticle.mutateAsync({
        title,
        content: articleType === 'script' ? JSON.stringify(scriptRows) : (content || undefined),
        articleType,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        status,
      });
      toast({ title: 'Article created', description: 'Knowledge article has been created' });
      router.push('/knowledge');
    } catch {
      toast({ title: 'Error', description: 'Failed to create article', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Article</h1>
          <p className="text-sm text-muted-foreground">Create a knowledge article, SOP, or guide</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Article Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" required />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={articleType} onValueChange={setArticleType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sop">SOP</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="case_study">Case Study</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                  <SelectItem value="filter_question">Filter Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {articleType === 'script' ? (
              <div className="space-y-2">
                <Label>Script Rows</Label>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-medium w-1/2">Script Text</th>
                        <th className="text-left p-2 font-medium w-1/2">Customer Type</th>
                        <th className="w-10 p-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {scriptRows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-1">
                            <textarea
                              className="w-full min-h-[60px] rounded border border-input bg-background px-2 py-1 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={row.text}
                              onChange={(e) => {
                                const next = [...scriptRows];
                                next[i] = { ...next[i], text: e.target.value };
                                setScriptRows(next);
                              }}
                              placeholder="Script text..."
                            />
                          </td>
                          <td className="p-1">
                            <input
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={row.customerType}
                              onChange={(e) => {
                                const next = [...scriptRows];
                                next[i] = { ...next[i], customerType: e.target.value };
                                setScriptRows(next);
                              }}
                              placeholder="e.g. New leads, Existing clients..."
                            />
                          </td>
                          <td className="p-1">
                            {scriptRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setScriptRows(scriptRows.filter((_, j) => j !== i))}
                                className="text-destructive hover:text-destructive/80 text-lg leading-none px-1"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setScriptRows([...scriptRows, { text: '', customerType: '' }])}>
                  + Add Row
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Content</Label>
                <textarea
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. onboarding, sales, social media" />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/knowledge')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title}>
            <Save className="mr-2 h-4 w-4" /> {submitting ? 'Creating...' : 'Create Article'}
          </Button>
        </div>
      </form>
    </div>
  );
}
