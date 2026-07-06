'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useSaveQualification, useQualification } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Thermometer, Lightbulb, Target, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api';

interface LeadQualificationFormProps {
  leadId: string;
  onSuccess?: () => void;
  persistedScore?: number | null;
  persistedSubScores?: { serviceType?: string; clarityLevel?: string; budgetLevel?: string; opportunitySize?: string } | null;
}

const serviceScoreMap: Record<string, number> = {
  full_service: 3,
  social_content: 2,
  video_design: 1,
  other: 0,
};

const budgetMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
const urgencyMap: Record<string, number> = { not_urgent: 0, next_quarter: 1, this_month: 2, immediate: 3 };
const timelineMap: Record<string, number> = { '6_plus': 0, '3_6_months': 1, '2_3_months': 2, '1_month': 3 };

function computeScores(values: Record<string, any>) {
  const serviceTypeScore = serviceScoreMap[values.serviceRequested] ?? 0;

  const budgetScore = budgetMap[values.budget] ?? 0;
  const opportunityScore = budgetScore;

  const urgencyScore = urgencyMap[values.urgency] ?? 0;
  const timelineScore = timelineMap[values.expectedTimeline] ?? 0;
  let clarityScore = Math.max(urgencyScore, timelineScore);

  if (values.decisionMaker === 'yes') {
    clarityScore = Math.min(clarityScore + 1, 3);
  }

  const totalScore = serviceTypeScore + clarityScore + budgetScore + opportunityScore;

  let classification: 'hot' | 'warm' | 'cold';
  if (totalScore >= 8) classification = 'hot';
  else if (totalScore >= 5) classification = 'warm';
  else classification = 'cold';

  let decision: string;
  if (totalScore >= 8) {
    decision = 'Schedule Discovery Meeting';
  } else if (totalScore >= 5 && values.serviceRequested && values.serviceRequested !== 'other') {
    decision = values.budget && values.decisionMaker === 'yes' ? 'Create Proposal' : 'Schedule Qualification Meeting';
  } else {
    decision = 'Low Priority Follow-up';
  }

  return { serviceTypeScore, clarityScore, budgetScore, opportunityScore, totalScore, classification, decision };
}

export default function LeadQualificationForm({ leadId, onSuccess, persistedScore, persistedSubScores }: LeadQualificationFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: existing } = useQualification(leadId);
  const saveQualification = useSaveQualification();
  const { register, handleSubmit, setValue, reset, watch } = useForm();

  useEffect(() => {
    if (existing) {
      reset({
        serviceRequested: existing.serviceRequested || '',
        businessGoal: existing.businessGoal || '',
        budget: existing.budget || '',
        urgency: existing.urgency || '',
        previousAgency: existing.previousAgency || '',
        expectedTimeline: existing.expectedTimeline || '',
        decisionMaker: existing.decisionMaker || '',
        additionalNotes: existing.additionalNotes || '',
      });
    }
  }, [existing, reset]);

  const values = watch();
  const computed = useMemo(() => computeScores(values), [values]);
  const hasFormData = Object.values(values).some((v) => v && v !== '');

  const hasPersistedScore = persistedScore != null && persistedScore > 0;
  const scores = useMemo(() => {
    if (hasPersistedScore) {
      return {
        totalScore: persistedScore,
        serviceTypeScore: persistedSubScores?.serviceType ? Number(persistedSubScores.serviceType) : 0,
        clarityScore: persistedSubScores?.clarityLevel ? Number(persistedSubScores.clarityLevel) : 0,
        budgetScore: persistedSubScores?.budgetLevel ? Number(persistedSubScores.budgetLevel) : 0,
        opportunityScore: persistedSubScores?.opportunitySize ? Number(persistedSubScores.opportunitySize) : 0,
      };
    }
    return computed;
  }, [hasPersistedScore, persistedScore, persistedSubScores, computed]);

  let classification: 'hot' | 'warm' | 'cold';
  if (scores.totalScore >= 8) classification = 'hot';
  else if (scores.totalScore >= 5) classification = 'warm';
  else classification = 'cold';

  const showScores = hasFormData || hasPersistedScore;

  const onSubmit = async (data: any) => {
    try {
      await saveQualification.mutateAsync({ id: leadId, data });
      toast({ title: t('common.success'), description: t('crm.qualificationSaved') });
      onSuccess?.();
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {showScores && (
        <>
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t('crm.totalScore')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{scores.totalScore}</span>
                <span className="text-muted-foreground">/10</span>
                <Badge variant={classification === 'hot' ? 'destructive' : classification === 'warm' ? 'default' : 'secondary'} className="capitalize ml-2">
                  <Thermometer className="h-3 w-3 mr-1" />
                  {classification}
                </Badge>
              </div>
            </div>
            <Progress value={scores.totalScore * 10} className="h-2" />
            <div className="grid grid-cols-4 gap-3 text-xs">
              {[
                { label: t('crm.serviceType'), score: scores.serviceTypeScore, max: 3, icon: Lightbulb },
                { label: t('crm.clarityLevel'), score: scores.clarityScore, max: 3, icon: TrendingUp },
                { label: t('crm.budget'), score: scores.budgetScore, max: 2, icon: DollarSign },
                { label: t('crm.opportunitySize'), score: scores.opportunityScore, max: 2, icon: Clock },
              ].map(({ label, score, max, icon: Icon }) => (
                <div key={label} className="text-center p-2 bg-background rounded">
                  <Icon className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-muted-foreground truncate">{label}</p>
                  <p className="font-bold">{score}/{max}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-primary/5 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{t('crm.suggestedNextAction')}</p>
              <p className="text-sm text-muted-foreground">{computed.decision}</p>
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>{t('crm.serviceRequested')}</Label>
        <Select onValueChange={(v) => setValue('serviceRequested', v)} value={values.serviceRequested || existing?.serviceRequested || ''}>
          <SelectTrigger>
            <SelectValue placeholder={t('crm.selectService')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_service">{t('crm.serviceRequestedFullService')}</SelectItem>
            <SelectItem value="social_content">{t('crm.serviceRequestedSocialContent')}</SelectItem>
            <SelectItem value="video_design">{t('crm.serviceRequestedVideoDesign')}</SelectItem>
            <SelectItem value="other">{t('common.other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('crm.businessGoal')}</Label>
        <Textarea {...register('businessGoal')} placeholder={t('crm.businessGoal')} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('crm.budget')}</Label>
          <Select onValueChange={(v) => setValue('budget', v)} value={values.budget || existing?.budget || ''}>
            <SelectTrigger>
              <SelectValue placeholder={t('crm.selectBudget')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('crm.budgetLow')}</SelectItem>
              <SelectItem value="medium">{t('crm.budgetMedium')}</SelectItem>
              <SelectItem value="high">{t('crm.budgetHigh')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('crm.urgency')}</Label>
          <Select onValueChange={(v) => setValue('urgency', v)} value={values.urgency || existing?.urgency || ''}>
            <SelectTrigger>
              <SelectValue placeholder={t('crm.selectUrgency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">{t('crm.urgencyImmediate')}</SelectItem>
              <SelectItem value="this_month">{t('crm.urgencyThisMonth')}</SelectItem>
              <SelectItem value="next_quarter">{t('crm.urgencyNextQuarter')}</SelectItem>
              <SelectItem value="not_urgent">{t('crm.urgencyNotUrgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('crm.previousAgency')}</Label>
          <Select onValueChange={(v) => setValue('previousAgency', v)} value={values.previousAgency || existing?.previousAgency || ''}>
            <SelectTrigger>
              <SelectValue placeholder={t('crm.selectPreviousAgency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('common.yes')}</SelectItem>
              <SelectItem value="no">{t('common.no')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('crm.expectedTimeline')}</Label>
          <Select onValueChange={(v) => setValue('expectedTimeline', v)} value={values.expectedTimeline || existing?.expectedTimeline || ''}>
            <SelectTrigger>
              <SelectValue placeholder={t('crm.selectTimeline')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_month">{t('crm.timeline1Month')}</SelectItem>
              <SelectItem value="2_3_months">{t('crm.timeline2_3Months')}</SelectItem>
              <SelectItem value="3_6_months">{t('crm.timeline3_6Months')}</SelectItem>
              <SelectItem value="6_plus">{t('crm.timeline6Plus')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('crm.decisionMaker')}</Label>
        <Select onValueChange={(v) => setValue('decisionMaker', v)} value={values.decisionMaker || existing?.decisionMaker || ''}>
          <SelectTrigger>
            <SelectValue placeholder={t('crm.selectDecisionMaker')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">{t('common.yes')}</SelectItem>
            <SelectItem value="no">{t('common.no')}</SelectItem>
            <SelectItem value="unknown">{t('crm.unknown')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('crm.additionalNotes')}</Label>
        <Textarea {...register('additionalNotes')} placeholder={t('crm.additionalNotes')} rows={3} />
      </div>

      <Button type="submit" className="w-full" disabled={saveQualification.isPending}>
        {saveQualification.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.saving')}</>
        ) : (
          t('common.save')
        )}
      </Button>
    </form>
  );
}
