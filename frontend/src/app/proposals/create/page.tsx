'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients, useCreateProposal } from '@/hooks/useApi';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  { id: 0, label: 'Client' },
  { id: 1, label: 'Scope' },
  { id: 2, label: 'Technical' },
  { id: 3, label: 'Pricing' },
  { id: 4, label: 'Preview' },
];

export default function CreateProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: clientsData } = useClients();
  const createProposal = useCreateProposal();

  const [currentStep, setCurrentStep] = useState(0);
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [technicalContent, setTechnicalContent] = useState('');
  const [financialContent, setFinancialContent] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [currency, setCurrency] = useState('LYD');
  const [validityDays, setValidityDays] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const clients = clientsData?.data || [];

  const canNext = () => {
    if (currentStep === 0) return !!clientId && !!title;
    if (currentStep === 1) return !!scopeOfWork;
    if (currentStep === 2) return true;
    if (currentStep === 3) return !!totalValue;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createProposal.mutateAsync({
        clientId,
        title,
        scopeOfWork: { description: scopeOfWork },
        technicalContent,
        financialContent,
        totalValue: parseFloat(totalValue),
        currency,
        validityDays: parseInt(validityDays),
      });
      toast({ title: 'Proposal created', description: 'Your proposal has been created successfully' });
      router.push('/proposals');
    } catch {
      toast({ title: 'Error', description: 'Failed to create proposal', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Proposal</h1>
          <p className="text-sm text-muted-foreground">Multi-step proposal creation wizard</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                i < currentStep ? 'bg-primary text-primary-foreground' :
                i === currentStep ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {i < currentStep ? <Check className="h-4 w-4" /> : step.id + 1}
              </div>
              <span className={cn(
                'text-sm hidden sm:inline',
                i === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-2',
                i < currentStep ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Proposal title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - {c.company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <div className="space-y-2">
              <Label>Scope of Work</Label>
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the scope of work, including inclusions, exclusions, and deliverables..."
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-2">
              <Label>Technical Content</Label>
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the technical approach, methodology, and implementation details..."
                value={technicalContent}
                onChange={(e) => setTechnicalContent(e.target.value)}
              />
            </div>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label>Total Value</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LYD">LYD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Validity (days)</Label>
                  <Input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Title</span>
                  <p className="font-medium">{title}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Client</span>
                  <p className="font-medium">{selectedClient?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <p className="font-medium">{currency} {parseFloat(totalValue || '0').toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Validity</span>
                  <p className="font-medium">{validityDays} days</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Scope of Work</span>
                <p className="text-sm whitespace-pre-wrap mt-1">{scopeOfWork}</p>
              </div>
              {technicalContent && (
                <div>
                  <span className="text-sm text-muted-foreground">Technical Content</span>
                  <p className="text-sm whitespace-pre-wrap mt-1">{technicalContent}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={currentStep === 0 ? () => router.push('/proposals') : handlePrev}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} disabled={!canNext()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Proposal'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
