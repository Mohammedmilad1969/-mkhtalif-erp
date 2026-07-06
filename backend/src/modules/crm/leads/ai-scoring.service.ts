import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'mail.com', 'protonmail.com', 'icloud.com', 'live.com', 'msn.com',
  'yandex.com', 'zoho.com', 'gmx.com',
]);

const HIGH_VALUE_SOURCES = ['referral', 'call', 'whatsapp', 'partner'];
const MEDIUM_VALUE_SOURCES = ['website', 'linkedin', 'facebook', 'instagram'];
const LOW_VALUE_SOURCES = ['other', 'event', 'advertisement'];

const HIGH_VALUE_INDUSTRIES = [
  'saas', 'software', 'technology', 'ecommerce', 'fintech',
  'healthcare', 'realestate', 'logistics', 'manufacturing',
  'consulting', 'agency', 'marketing', 'education',
];

const WEBSITE_TLDS = ['.com', '.io', '.ai', '.app', '.co', '.org', '.net'];

@Injectable()
export class AiScoringService {
  constructor(private prisma: PrismaService) {}

  async scoreLead(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        qualification: true,
        stage: true,
        activities: { take: 20, orderBy: { createdAt: 'desc' } },
        leadTasks: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    const factors: { name: string; score: number; max: number; detail: string }[] = [];

    // 1. Source quality (0-10)
    const sourceScore = this.scoreSource(lead.source || '');
    factors.push({
      name: 'Source Quality',
      score: sourceScore,
      max: 10,
      detail: this.sourceDetail(lead.source || ''),
    });

    // 2. Company presence (0-10)
    const companyScore = this.scoreCompany(lead.company || '');
    factors.push({
      name: 'Company Presence',
      score: companyScore,
      max: 10,
      detail: this.companyDetail(lead.company || ''),
    });

    // 3. Email quality (0-10)
    const emailScore = this.scoreEmail(lead.email || '', lead.company || '');
    factors.push({
      name: 'Email Quality',
      score: emailScore,
      max: 10,
      detail: this.emailDetail(lead.email || '', lead.company || ''),
    });

    // 4. Data completeness (0-10)
    const completenessScore = this.scoreCompleteness(lead);
    factors.push({
      name: 'Data Completeness',
      score: completenessScore,
      max: 10,
      detail: this.getCompletenessDetail(lead),
    });

    // 5. Industry relevance (0-10)
    const industryScore = this.scoreIndustry(lead.company || '', lead.source || '');
    factors.push({
      name: 'Industry Relevance',
      score: industryScore,
      max: 10,
      detail: this.industryDetail(lead.company || ''),
    });

    // 6. Website & online presence (0-10)
    const websiteScore = this.scoreWebsite(lead.website || '', lead.company || '');
    factors.push({
      name: 'Online Presence',
      score: websiteScore,
      max: 10,
      detail: this.websiteDetail(lead.website || '', lead.company || ''),
    });

    // 7. Budget potential (0-10)
    const rawMin = lead.budgetMin != null ? Number(lead.budgetMin) : null;
    const rawMax = lead.budgetMax != null ? Number(lead.budgetMax) : null;
    const budgetScore = this.scoreBudget(rawMin, rawMax);
    factors.push({
      name: 'Budget Potential',
      score: budgetScore,
      max: 10,
      detail: this.budgetDetail(rawMin, rawMax),
    });

    // 8. Activity & engagement (0-10)
    const engagementScore = this.scoreEngagement(lead);
    factors.push({
      name: 'Engagement Level',
      score: engagementScore,
      max: 10,
      detail: this.engagementDetail(lead),
    });

    const totalMax = factors.reduce((sum, f) => sum + f.max, 0);
    const totalRaw = factors.reduce((sum, f) => sum + f.score, 0);
    const totalScore = Math.round((totalRaw / totalMax) * 10);

    const confidence = this.calculateConfidence(factors);

    return {
      leadId: lead.id,
      clientName: lead.clientName,
      aiScore: Math.min(totalScore, 10),
      currentScore: lead.leadScore,
      temperature: this.scoreToTemperature(totalScore),
      confidence,
      factors,
      computedAt: new Date().toISOString(),
    };
  }

  private scoreSource(source: string): number {
    const s = source.toLowerCase().trim();
    if (!s) return 0;
    if (HIGH_VALUE_SOURCES.includes(s)) return 9;
    if (MEDIUM_VALUE_SOURCES.includes(s)) return 6;
    if (LOW_VALUE_SOURCES.includes(s)) return 2;
    return 4;
  }

  private sourceDetail(source: string): string {
    if (!source) return 'No source recorded';
    return `Lead source: "${source}" (${HIGH_VALUE_SOURCES.includes(source.toLowerCase()) ? 'high quality' : MEDIUM_VALUE_SOURCES.includes(source.toLowerCase()) ? 'medium quality' : 'standard'})`;
  }

  private scoreCompany(company: string): number {
    if (!company || company.trim().length < 2) return 0;
    const c = company.trim();
    if (c.length >= 10) return 9;
    if (c.length >= 5) return 6;
    return 3;
  }

  private companyDetail(company: string): string {
    if (!company || company.trim().length < 2) return 'No company provided';
    return `Company: "${company.trim()}" (${company.trim().length >= 10 ? 'established' : company.trim().length >= 5 ? 'recognizable' : 'minimal'})`;
  }

  private scoreEmail(email: string, company: string): number {
    if (!email || !email.includes('@')) return 0;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 0;
    if (FREE_EMAIL_DOMAINS.has(domain)) return 4;
    if (company && company.toLowerCase().includes(domain.replace('.com', '').replace('.io', '').replace('.org', '').replace('.net', ''))) return 9;
    return 7;
  }

  private emailDetail(email: string, company: string): string {
    if (!email || !email.includes('@')) return 'No email provided';
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 'Invalid email format';
    if (FREE_EMAIL_DOMAINS.has(domain)) return `Free email (${domain})`;
    if (company && company.toLowerCase().includes(domain.replace('.com', '').replace('.io', '').replace('.org', '').replace('.net', ''))) return `Corporate email — matches company domain`;
    return `Business email (${domain})`;
  }

  private scoreCompleteness(lead: any): number {
    let filled = 0;
    const fields = [lead.clientName, lead.company, lead.email, lead.phone, lead.source, lead.website, lead.budgetMin, lead.budgetMax];
    filled += fields.filter((f) => f != null && f !== '').length;
    if (lead.qualification?.decisionMaker === true) filled += 1;
    if (lead.qualification?.budget === true) filled += 1;
    if (lead.qualification?.authority === true) filled += 1;
    if (lead.qualification?.needsTimeline === true) filled += 1;
    if (filled >= 10) return 10;
    if (filled >= 8) return 8;
    if (filled >= 6) return 6;
    if (filled >= 4) return 4;
    if (filled >= 2) return 2;
    return 0;
  }

  private getCompletenessDetail(lead: any): string {
    const parts: string[] = [];
    if (lead.clientName) parts.push('name');
    if (lead.company) parts.push('company');
    if (lead.email) parts.push('email');
    if (lead.phone) parts.push('phone');
    if (lead.source) parts.push('source');
    if (lead.website) parts.push('website');
    if (lead.budgetMin != null) parts.push('budget');
    if (lead.leadScore != null) parts.push('score');
    if (lead.qualification?.decisionMaker) parts.push('DM');
    if (lead.qualification?.budget) parts.push('budget-confirmed');
    if (lead.qualification?.authority) parts.push('authority');
    return `${parts.length} data points: ${parts.join(', ')}`;
  }

  private scoreIndustry(company: string, source: string): number {
    if (!company) return 0;
    const c = company.toLowerCase();
    let score = 0;
    for (const kw of HIGH_VALUE_INDUSTRIES) {
      if (c.includes(kw)) { score = Math.max(score, 9); }
    }
    if (source === 'referral') score = Math.max(score, 7);
    if (source === 'website' || source === 'call') score = Math.max(score, 5);
    if (source === 'linkedin') score = Math.max(score, 6);
    if (score === 0 && company.trim().length >= 3) score = 2;
    return score;
  }

  private industryDetail(company: string): string {
    if (!company) return 'No company to analyze industry';
    const c = company.toLowerCase();
    for (const kw of HIGH_VALUE_INDUSTRIES) {
      if (c.includes(kw)) return `High-value industry detected: ${kw}`;
    }
    return `Standard industry — no specific high-value keywords matched`;
  }

  private scoreWebsite(website: string, company: string): number {
    if (website && website.trim().length > 0) {
      const w = website.toLowerCase();
      let score = 6;
      if (w.startsWith('https://') || w.startsWith('http://')) score += 1;
      for (const tld of WEBSITE_TLDS) {
        if (w.includes(tld)) { score += 1; break; }
      }
      if (company && w.includes(company.toLowerCase().replace(/\s+/g, ''))) score += 2;
      return Math.min(score, 10);
    }
    if (company && company.trim().length >= 5) return 3;
    return 0;
  }

  private websiteDetail(website: string, company: string): string {
    if (!website) return 'No website provided';
    return `Website: ${website} (${this.hasCustomDomain(website) ? 'custom domain' : 'basic'})`;
  }

  private hasCustomDomain(website: string): boolean {
    return WEBSITE_TLDS.some(tld => website.toLowerCase().includes(tld));
  }

  private scoreBudget(min: number | null, max: number | null): number {
    if (min == null && max == null) return 0;
    const effectiveMax = max || min || 0;
    const effectiveMin = min || 0;
    if (effectiveMax >= 100000) return 10;
    if (effectiveMax >= 50000) return 8;
    if (effectiveMax >= 10000) return 6;
    if (effectiveMax >= 5000) return 4;
    if (effectiveMax >= 1000) return 2;
    if (effectiveMin > 0) return 1;
    return 0;
  }

  private budgetDetail(min: number | null, max: number | null): string {
    if (min == null && max == null) return 'No budget range specified';
    const range = `${min ? `$${min.toLocaleString()}` : '?'} - ${max ? `$${max.toLocaleString()}` : '?'}`;
    return `Budget range: ${range}`;
  }

  private scoreEngagement(lead: any): number {
    let score = 0;
    const activities = lead.activities || [];
    const tasks = lead.leadTasks || [];
    if (activities.length > 0) {
      score += Math.min(activities.length, 4);
    }
    if (tasks.length > 0) {
      score += Math.min(tasks.length, 3);
    }
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    if (completedTasks > 0) score += 2;
    if (lead.leadScore != null && lead.leadScore > 0) score += 1;
    return Math.min(score, 10);
  }

  private engagementDetail(lead: any): string {
    const activities = lead.activities || [];
    const tasks = lead.leadTasks || [];
    const completed = tasks.filter((t: any) => t.status === 'completed').length;
    const parts: string[] = [];
    if (activities.length > 0) parts.push(`${activities.length} activities`);
    if (tasks.length > 0) parts.push(`${tasks.length} tasks (${completed} done)`);
    if (parts.length === 0) return 'No engagement data yet';
    return parts.join(', ');
  }

  private calculateConfidence(factors: { score: number; max: number }[]): string {
    const totalMax = factors.reduce((s, f) => s + f.max, 0);
    const totalScore = factors.reduce((s, f) => s + f.score, 0);
    const pct = totalMax > 0 ? totalScore / totalMax : 0;
    if (pct >= 0.8) return 'high';
    if (pct >= 0.5) return 'medium';
    return 'low';
  }

  private scoreToTemperature(score: number): string {
    if (score >= 8) return 'hot';
    if (score >= 5) return 'warm';
    return 'cold';
  }
}
