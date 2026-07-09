'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKnowledgeArticles } from '@/hooks/useApi';
import { KnowledgeArticle } from '@/types';
import { Plus, Search, BookOpen, FileText, ListChecks, FileCheck, HelpCircle, GraduationCap, ScrollText, Filter } from 'lucide-react';

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

const typeIcons: Record<string, React.ElementType> = {
  sop: BookOpen,
  checklist: ListChecks,
  template: FileText,
  guide: FileCheck,
  faq: HelpCircle,
  case_study: GraduationCap,
  script: ScrollText,
  filter_question: Filter,
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

const types = ['sop', 'checklist', 'template', 'guide', 'faq', 'case_study', 'script', 'filter_question'];

export default function KnowledgePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const { data, isLoading } = useKnowledgeArticles({ search, articleType: typeFilter, departmentId: deptFilter });
  const articles = data?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('knowledge.title')}</h1>
          <p className="text-sm text-muted-foreground">SOPs, guides, templates and documentation</p>
        </div>
        <Button onClick={() => router.push('/knowledge/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('knowledge.addArticle')}
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('knowledge.searchArticles')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('common.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('knowledge.allCategories')}</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{typeLabels[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          <Search className="mr-2 h-4 w-4" /> {t('common.search')}
        </Button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t('knowledge.noArticles')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => {
            const Icon = typeIcons[article.articleType] || BookOpen;
            return (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/knowledge/${article.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={typeVariants[article.articleType] || 'secondary'} className="text-[10px] px-1.5 py-0">
                          {typeLabels[article.articleType]}
                        </Badge>
                        {article.departmentId && (
                          <span className="text-xs text-muted-foreground capitalize">{article.departmentId}</span>
                        )}
                        <Badge variant={article.status === 'published' ? 'success' : article.status === 'archived' ? 'outline' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {article.status}
                        </Badge>
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{article.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      {article.author && (
                        <p className="text-xs text-muted-foreground mt-2">{article.author.name}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
