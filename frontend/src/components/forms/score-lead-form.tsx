'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useScoreLead } from '@/hooks/useApi';
import { getApiErrorMessage } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ScoreLeadFormProps {
  leadId: string;
  onSuccess?: () => void;
}

export default function ScoreLeadForm({ leadId, onSuccess }: ScoreLeadFormProps) {
  const { t } = useLanguage();
  const scoreLead = useScoreLead();
  const { toast } = useToast();
  const [scores, setScores] = useState({ serviceType: 0, clarityLevel: 0, budgetLevel: 0, opportunitySize: 0 });

  const total = scores.serviceType + scores.clarityLevel + scores.budgetLevel + scores.opportunitySize;

  let classification = '';
  if (total >= 8) classification = 'Hot Lead';
  else if (total >= 5) classification = 'Warm Lead';
  else if (total > 0) classification = 'Cold Lead';

  const handleChange = (field: string, value: string) => {
    const maxMap: Record<string, number> = { serviceType: 3, clarityLevel: 2, budgetLevel: 2, opportunitySize: 2 };
    const num = Math.min(Math.max(parseInt(value) || 0, 0), maxMap[field] || 3);
    setScores((prev) => ({ ...prev, [field]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scoreLead.mutateAsync({
        id: leadId,
        data: {
          serviceTypeScore: scores.serviceType,
          clarityScore: scores.clarityLevel,
          budgetScore: scores.budgetLevel,
          opportunityScore: scores.opportunitySize,
        },
      });
      onSuccess?.();
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const fields = [
    { key: 'serviceType', label: '1. Request Type', max: 3 },
    { key: 'clarityLevel', label: '2. Seriousness Level', max: 2 },
    { key: 'budgetLevel', label: '3. Budget', max: 2 },
    { key: 'opportunitySize', label: '4. Opportunity Size', max: 2 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ key, label, max }) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type="number"
            min={0}
            max={max}
            value={(scores as any)[key]}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}

      <div className="p-3 bg-muted rounded-lg text-center space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">{t('crm.totalScore')}: </span>
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-sm text-muted-foreground"> /10</span>
        </div>
        {classification && (
          <Badge variant={
            classification === 'Hot Lead' ? 'destructive' :
            classification === 'Warm Lead' ? 'default' : 'secondary'
          }>{classification}</Badge>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={scoreLead.isPending}>
        {scoreLead.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('crm.scoreLead')
        )}
      </Button>
    </form>
  );
}
