# Mkhtalif ERP — Complete Implementation Blueprint

## Executive Summary

Mkhtalif is transforming from a founder-operated marketing agency into a **self-running enterprise operating system**. This blueprint defines the complete ERP/Agency Operating System (AOS) required to manage all aspects of the business — marketing, sales, CRM, delivery, finance, HR, and executive leadership — as an integrated, automated, data-driven platform.

The system is architected around 6 core "Machines": Growth, Sales, Client Success, Strategy, Production, and Operations. The client journey spans 9+ stages from lead capture through renewal, each governed by SOPs, decision trees, KPIs, and automation rules. The goal is a **Franchise Prototype** — a business that can be replicated, scaled, and operated without founder dependency.

---

## 1. Business Analysis

### 1.1 Company Structure

#### Departments & 6 Machines

| Machine | Department | Primary Function | Key Roles |
|---------|-----------|-----------------|-----------|
| **Growth Machine** | Marketing | Lead Generation, Content, Ads | Growth Lead, Content Creator, Media Buyer |
| **Sales Machine** | Sales | Qualification, Discovery, Closing | Sales Rep, Sales Team Lead, Head of Sales |
| **Client Success Machine** | Client Services | Onboarding, Communication, Retention | Account Manager, Account Director |
| **Strategy Machine** | Strategy | Research, Insights, Creative Direction | Strategist, Strategic Lead, Head of Strategy |
| **Production Machine** | Production | Design, Video, Copy, Publishing | Designer, Video Editor, Copywriter, Production Manager |
| **Operations Machine** | Operations | SOPs, KPIs, Automation, HR, Finance | Operations Manager, Admin, Finance Officer |

#### Role Definitions

**Founder/CEO**
- Vision, major decisions, culture, expansion
- Does NOT: daily follow-up, review every design, reply to every client
- Handles Level 4 decisions only (new departments, positioning changes, partnerships)

**Head of Sales**
- Owns the Sales Machine
- KPIs: Close Rate, Revenue, Lead → Meeting %, Proposal Acceptance Rate
- Approves discounts, reviews large proposals, handles escalations

**Account Manager**
- Owns client relationship post-sale
- Responsible for onboarding, communication, reporting, retention
- KPIs: Client Satisfaction, Retention Rate, Time to Kickoff, Response SLA

**Strategic Lead** (per project)
- Leads research, analysis, positioning, messaging, campaign direction
- KPIs: Strategy Win Rate, Campaign Performance, Brief Clarity Score

**Head of Strategy** (department level)
- Sets methodologies, standards, approves strategies, develops team
- All Strategic Leads report to them

**Production Manager**
- Runs the production sprint system
- KPIs: On-Time Delivery, Revision Rate, Quality Score, Sprint Completion Rate

**Operations Manager**
- SOP compliance, KPI tracking, process improvement, automation
- KPIs: SOP Compliance %, Team Efficiency, Automation Completion Rate

### 1.2 Decision Hierarchy

| Level | Type | Owner | Examples |
|-------|------|-------|----------|
| Level 1 | Operational | Employees | Follow-ups, simple edits, scheduling |
| Level 2 | Managerial | Team Leads | Priority changes, work distribution, internal approvals |
| Level 3 | Strategic | Department Heads | Strategy changes, scope adjustments, pricing exceptions |
| Level 4 | Vision/Scale | Founder | New departments, positioning changes, partnerships, major investments |

### 1.3 Operating Systems

#### Marketing System (Growth Machine)
- Channels: Instagram, Facebook, Website, Referrals, WhatsApp
- Lead generation tracking: source, cost per lead, conversion by channel
- Campaign management: awareness → interest → conversion → retention
- Content pillars: Education, Trust, Case Studies, Behind the Scenes, Offers

#### Sales System (Sales Machine)
- Lead Scoring (0-10): Service Type + Clarity + Budget + Opportunity Size
- Routing: Hot → Meeting, Warm + Clear → Proposal, Warm + Unclear → Call, Cold → Nurture
- Sales Scripts for: qualification, discovery, objection handling, closing
- Follow-up sequence: Day 1, Day 3, Day 7 → Lost with reason

#### Client Success System
- Welcome Pack within 24h
- Communication channel setup (WhatsApp/Email/Slack)
- Expectation alignment: what's included, excluded, timelines, responsibilities
- Reporting cadence: weekly/monthly
- Retention monitoring: satisfaction scores, risk flags

#### Strategy System
- 7 Layers: Intake → Context → Research → Analysis → Insight → Strategy Design → Translation
- Outputs: Research Report → Strategic Blueprint → Creative Brief
- Research includes: Business Analysis, Social Analysis, Market Analysis, Competitor Analysis, Audience Analysis, SWOT

#### Execution System (Production)
- Weekly Sprints: Planning → Daily Tracking → Mid-Sprint Check → Review
- Asset types: Video Ads, Reels, Static Designs, Copywriting, Landing Pages
- Quality Control: Strategy Alignment, Brand Guidelines, Impact Assessment
- Launch: Channel selection, timing, performance monitoring

#### Optimization System
- Data Capture: Ads performance, content performance, lead response, sales conversion
- Analysis: Compare vs targets, identify what worked/failed, categorize
- Insight Extraction: Find patterns, root causes
- System Improvement: Update SOPs, scripts, offers, creative direction
- Scaling Rules: Don't scale unproven 3x, don't double campaigns before optimization, don't hire before automation

#### Finance System
- Invoicing: first payment collection, milestone payments
- Payment Terms: clear terms, late payment policy
- Profitability: per client, per service, per campaign
- Cash flow monitoring
- Financial reporting: monthly P&L, revenue forecasting

#### HR System
- Role scorecards: What (ownership), How (SOPs), Success (KPIs)
- Hiring: scorecard-based interviews, trial tasks
- Performance reviews: KPI-based, quarterly
- Culture rules
- Delegation readiness assessment

---

## 2. Client Journey Blueprint

### Stage 1: Lead Capture (Awareness/Entry)

| Element | Detail |
|---------|--------|
| Purpose | Capture and respond to inbound inquiries professionally |
| Inputs | Inquiry via WhatsApp, Instagram DM, Website form, Call |
| Outputs | Lead recorded in CRM, initial response sent |
| Owner | Sales Team / Lead Manager |
| KPIs | Response Time (<10 min), Lead Capture Rate, Data Completeness % |
| Risks | Slow response, incomplete data capture |
| Approval Gate | None (auto-proceed based on response) |
| Escalation | N/A |
| Automation | Auto-reply, CRM entry, Lead assignment |

### Stage 2: Qualification

| Element | Detail |
|---------|--------|
| Purpose | Assess lead quality using scoring system |
| Inputs | Lead data, initial conversation |
| Outputs | Lead Score (0-10), Temperature (Hot/Warm/Cold), Next Action |
| Owner | Sales Rep |
| KPIs | Qualification Accuracy (>85%), Lead → Meeting Conversion (>40%) |
| Risks | Subjective scoring, missing data |
| Approval Gate | None (system-driven decision) |
| Escalation | Unclear high-value leads → Sales Team Lead |
| Automation | Score calculation, routing decision, CRM update |

### Stage 3: Discovery (Sales Action)

| Element | Detail |
|---------|--------|
| Purpose | Understand client reality, uncover problems, build trust |
| Inputs | Lead Score, CRM notes, previous conversations |
| Outputs | Discovery Notes, Pain Points, Opportunity Analysis, Decision Status |
| Owner | Sales Rep |
| KPIs | Discovery → Proposal Rate (>70%), Meeting Show Rate (>80%), Close Rate |
| Risks | Giving free strategy, losing control of conversation |
| Approval Gate | After meeting: Next Step Decision (Proposal/Follow-up/Reject) |
| Escalation | Large clients to Sales Team Lead |
| Automation | Meeting scheduling, CRM update, follow-up trigger |

### Stage 4: Proposal

| Element | Detail |
|---------|--------|
| Purpose | Convert discovery insights into a structured offer |
| Inputs | Discovery Notes, Research, Competitor Analysis |
| Outputs | Technical Proposal, Financial Proposal, SOW, Expectations Sheet, Mini Creative Brief |
| Owner | Sales Rep + Strategy Team (for research) |
| KPIs | Proposal Acceptance Rate, Turnaround Time (24-72h), Close Rate |
| Risks | Unclear scope, unrealistic expectations |
| Approval Gate | Internal review before sending |
| Escalation | Discounts, large projects → Sales Team Lead |
| Automation | Proposal creation, CRM update, follow-up sequence trigger |

### Stage 5: Closing & Contracting

| Element | Detail |
|---------|--------|
| Purpose | Formalize agreement, secure payment, protect legally |
| Inputs | Proposal, SOW, Financial Terms |
| Outputs | Signed Contract, Invoice, Payment Confirmation |
| Owner | Sales Rep + Finance |
| KPIs | Contract Completion (100%), First Payment Collection (high), Time to Contract |
| Risks | Starting work before payment, verbal agreements |
| Approval Gate | Payment received before execution begins |
| Escalation | Special terms, delayed payment → Sales Lead + Finance |
| Automation | Contract generation, invoice sending, payment reminders |

### Stage 6: Onboarding & Kickoff

| Element | Detail |
|---------|--------|
| Purpose | Make client feel welcome, align expectations, collect accesses, prepare team |
| Inputs | Contract, Proposal, Discovery Notes, SOW |
| Outputs | Welcome Pack Sent, Access Collection Complete, Kickoff Meeting Done |
| Owner | Account Manager |
| KPIs | Onboarding Completion (100%), Access Collection (100%), Time to Onboarding (<5 days) |
| Risks | Missing information, unresponsive client, broken promises |
| Approval Gate | Gate: Ready for Strategy (all data + accesses complete) |
| Escalation | Client unresponsive >5 days → Operations Manager |
| Automation | Welcome sequence, task generation, form sending |

### Stage 7: Strategy

| Element | Detail |
|--------|--------|
| Purpose | Turn data into strategic decisions and execution briefs |
| Inputs | Onboarding data, client accesses, discovery notes |
| Outputs | Research Report, Strategic Blueprint, Creative Brief |
| Owner | Strategic Lead |
| KPIs | Research Completion (100%), Strategy Win Rate, Brief Clarity Score |
| Risks | Research not informing decisions, skipping strategy layer |
| Approval Gate | Strategy Approved by Head of Strategy |
| Escalation | Insufficient data, legal/compliance risks |
| Automation | Research templates, reporting generation |

### Stage 8: Execution (Production)

| Element | Detail |
|---------|--------|
| Purpose | Turn strategy into campaign assets and published content |
| Inputs | Creative Brief, Strategy Blueprint |
| Outputs | Campaign Assets (Video, Design, Copy), Published Content |
| Owner | Production Manager |
| KPIs | On-Time Delivery, Revision Rate, Sprint Completion Rate, Quality Score |
| Risks | Production delays, quality issues, scope creep |
| Approval Gate | Internal QC → Client Approval → Launch |
| Escalation | Delays, quality issues → Production Manager |
| Automation | Task generation, scheduling, reminders, reporting |

### Stage 9: Reporting & Optimization

| Element | Detail |
|--------|--------|
| Purpose | Measure performance, extract insights, improve continuously |
| Inputs | Campaign performance data, analytics |
| Outputs | Performance Reports, Insights, System Improvements |
| Owner | Account Manager + Strategy Team |
| KPIs | ROI, CAC, Retention, Data Completeness |
| Risks | No data-driven decisions, repeating mistakes |
| Approval Gate | Monthly review with client |
| Escalation | Underperformance triggers strategy revision |
| Automation | Dashboard generation, alerting, weekly report generation |

### Stage 10: Renewal / Upsell / Retention

| Element | Detail |
|--------|--------|
| Purpose | Retain clients, identify growth opportunities |
| Inputs | Performance data, satisfaction scores, usage metrics |
| Outputs | Renewal Proposal, Upsell Offer |
| Owner | Account Manager |
| KPIs | Retention Rate, Upsell Rate, Client Satisfaction |
| Risks | Churn, dissatisfaction |
| Approval Gate | Renewal terms approved internally |
| Escalation | At-risk clients → Account Director |
| Automation | Renewal reminders, satisfaction surveys |

---

## 3. ERP Module Specifications

### 3.1 CRM Module

**Purpose:** Central hub for all client and lead data; the "nervous system" of the agency.

**Features:**
- Lead pipeline management (9 stages: New Lead → Qualification → Qualified → Meeting Scheduled → Proposal Sent → Negotiation → Won → Lost → Archive)
- Lead scoring engine (0-10 based on 4 criteria)
- Activity log (calls, messages, meetings, follow-ups with timestamps)
- Pipeline visualization with probability % per deal
- Mandatory fields enforcement (Owner, Next Action, Stage)
- Lost reason tracking with analytics
- Lead assignment and routing rules
- CRM update compliance monitoring

**Workflows:**
- Lead Capture → Auto-scoring → Routing → Assignment
- Stage change triggers next action assignment
- Follow-up sequence creation and tracking

**User Roles & Permissions:**
- Sales Rep: View/edit assigned leads, update stages, log activities
- Sales Team Lead: View all leads, reassign, approve stage changes
- Head of Sales: Full access, reporting, configuration
- Admin: CRM configuration, data cleanup
- Account Manager: View won clients handover data

**KPIs:**
- CRM Completion Rate (target: 100%)
- Leads Without Next Action (target: 0%)
- Update Compliance (target: 100%)
- Pipeline Accuracy

**Database Entities:**
- `leads`, `activities`, `pipeline_stages`, `lead_scores`, `loss_reasons`

### 3.2 Lead Qualification System

**Purpose:** Standardized scoring and routing of all inbound leads.

**Features:**
- 4-criteria scoring form (Service Type 0-3, Clarity 0-3, Budget 0-2, Opportunity Size 0-2)
- Automatic temperature classification (Hot 8-10, Warm 5-7, Cold 0-4)
- Routing decision engine based on score + clarity
- SLA tracking (Hot: 1h, Warm: 24h)
- Lead enrichment through qualification scripts

**Workflows:**
- Lead Entry → Score → Route → Assign → Next Action Set
- Hot Lead Alerts → Immediate Assignment

### 3.3 Discovery Meeting System

**Purpose:** Structured sales meetings that diagnose client problems and build authority.

**Features:**
- Pre-meeting checklist (client data review, goal setting, question prep)
- 7-Stage Meeting Structure (Opening → Business Understanding → Problem Discovery → Goal Extraction → Qualification Confirmation → Strategic Positioning → Next Step)
- Client type handling (Confused, Dominant, Silent) with specific scripts
- Control recovery techniques
- Meeting notes template
- CRM auto-update rules

### 3.4 Proposal Management

**Purpose:** Create, present, and follow up on proposals systematically.

**Features:**
- Built-in Research & Competitor Analysis
- SOW builder (included/excluded/deliverables/revisions/timeline/client responsibilities)
- Expectations Sheet (what success means, what depends on client, what's not guaranteed)
- Technical + Financial proposal sections
- Mini Creative Brief (direction, not full execution)
- Offer presentation meeting structure
- 3-stage follow-up system (Day 1, 3, 7)
- Decision matrix for proposal outcomes
- Pricing approval rules

### 3.5 Contract Management

**Purpose:** Formalize agreements with legal and operational protection.

**Features:**
- Contract template with standard clauses (scope, deliverables, duration, fees, payment terms, IP, confidentiality, cancellation, liability limits)
- Approval workflow (internal review → send → sign → file)
- Invoice generation linked to contract
- Payment tracking (first payment + milestones)
- Payment receipt confirmation
- CRM update on completion

### 3.6 Client Onboarding Module

**Purpose:** Make the client feel secure and prepare the project for execution.

**Features:**
- Welcome Pack delivery
- Account Manager introduction
- Client Summary Sheet (why they bought, pain points, fears, expectations, promises made)
- Access Collection (Meta, Google, TikTok, Website, Domain, Hosting, Email, CRM)
- Brand Asset Collection
- Internal Handover meeting
- Kickoff Meeting with client
- Project workspace setup (folders, boards, communication channels)
- Onboarding gate: Ready for Strategy checklist

### 3.7 Strategy Workspace

**Purpose:** Central space for research, planning, and strategy document creation.

**Features:**
- Research Report builder (Business Analysis, Social Analysis, Market Analysis, Competitor Analysis, Audience Analysis, SWOT, Key Findings)
- Strategic Blueprint builder (14 sections: Executive Summary through Strategic Recommendations)
- Creative Brief builder (12 sections: Overview through Timeline)
- Insight extraction tools (observation → pattern → insight → implication)
- SWOT analysis canvas
- Audience Persona creator (ICP, Buyer Personas, Pain Points, Objections, Triggers)
- Competitor Matrix builder
- Strategy approval workflow

### 3.8 Project Management Module

**Purpose:** Run production like a factory with weekly sprints.

**Features:**
- Sprint planning board (To Do → In Progress → Review → Approved → Delivered)
- Weekly sprint cycle: Planning → Daily Tracking → Mid-Sprint Check → Review
- Task distribution with RACI per task
- Asset production tracking (Video, Design, Copy, Ads)
- Timeline management with deadlines
- Dependency tracking
- Production velocity metrics

### 3.9 Approval System

**Purpose:** Gate system preventing poor quality from reaching clients.

**Features:**
- Multi-level approvals: Internal QC → Strategy Alignment → Client Approval
- Approval gates at: Strategy → Execution, Internal Review → Client Review, Client Approval → Launch
- Revision tracking (revision limits per project)
- Quality criteria checklist per asset type
- Approval/rejection with reason
- Escalation for stuck approvals

### 3.10 Client Portal

**Purpose:** Transparent client communication and reporting.

**Features:**
- Project status dashboard
- Deliverable gallery
- Report access (weekly/monthly)
- Communication history
- Request submission (with SLA tracking)
- Approval requests
- Invoice and payment history

### 3.11 Customer Success Module

**Purpose:** Monitor and improve client satisfaction and retention.

**Features:**
- Client satisfaction surveys (NPS, CSAT)
- Risk flagging (unresponsive, late payments, low engagement, complaints)
- Retention prediction
- Renewal management
- Upsell opportunity identification
- Quarterly business review templates

### 3.12 KPI Management Module

**Purpose:** Track all KPIs in one place with dashboards.

**Features:**
- KPI library with formulas, targets, data sources
- Department dashboards (Sales, Marketing, Production, Strategy, Operations, Finance, Executive)
- Real-time KPI updates
- KPI alerts (red/yellow/green thresholds)
- Trend analysis (weekly, monthly, quarterly)
- Automated reporting

### 3.13 Knowledge Base Module

**Purpose:** Central repository for all company knowledge.

**Features:**
- SOP documents (16-section structure)
- Checklists (quick execution)
- Templates (scripts, forms, documents)
- Video walkthroughs (Loom integration)
- Role Cards (What/How/Success per role)
- Searchable across all content
- Version control
- Related systems cross-referencing

### 3.14 SOP Management

**Purpose:** Create, update, and enforce SOPs across the organization.

**Features:**
- SOP creation with unified template (16 sections)
- Version management
- Approval workflow for SOP changes
- SOP-to-CRM stage mapping
- SOP compliance tracking
- Training assignment
- Video embedding

### 3.15 Decision Playbooks

**Purpose:** Make the Decision OS actionable.

**Features:**
- Decision trees with visual flowcharts
- Decision rules engine (IF → THEN logic)
- Approval matrix per decision type
- Escalation rules
- Required inputs/outputs per decision
- RACI per decision node

### 3.16 HR Module

**Purpose:** Manage hiring, performance, and team growth.

**Features:**
- Role scorecards (What/How/Success)
- Job description templates
- Interview scorecards
- Trial task management
- KPI-based performance reviews
- Culture rules enforcement
- Delegation readiness tracking

### 3.17 Finance Module

**Purpose:** Full financial management.

**Features:**
- Invoice generation
- Payment tracking (received/pending/overdue)
- Payment reminders
- Milestone billing
- Profitability per client, project, service
- Cash flow dashboard
- Revenue forecasting
- Expense tracking
- Financial reporting (P&L, Balance Sheet basics)

### 3.18 Automation Center

**Purpose:** Central management of all automations.

**Features:**
- Trigger library (new lead, stage change, time-based, condition met)
- Action builder (send message, update field, create task, send notification)
- Condition builder (IF/AND/OR logic)
- Notification rules (who gets notified, how, when)
- Escalation rules (what happens if automation fails)
- Automation testing sandbox
- Audit log of all automation runs

### 3.19 Executive Dashboard

**Purpose:** Know company status in 5 minutes.

**Metrics:**
- **Sales:** Leads, Revenue, Close Rate, Pipeline Value
- **Delivery:** Active Projects, Delays, Quality Score
- **Clients:** Satisfaction, At-Risk Count, Retention Rate
- **Finance:** Cash Flow, Profitability, AR Aging
- **Operations:** SOP Compliance, Automation Completion, Team Efficiency

---

## 4. Decision Operating System

### 4.1 Lead Qualification Decision

| Criteria | Rule |
|----------|------|
| Score ≥ 8 (Hot) | Book Discovery Meeting within 24h |
| Score 5-7 + Clear Request | Send Proposal |
| Score 5-7 + Unclear Request | Qualification Call |
| Score ≤ 4 | Low Priority Follow-up or Archive |
| Decision Owner | Sales Rep |
| Escalation | Sales Team Lead for unclear high-value |
| Required Inputs | Lead Score, Request Clarity |
| Expected Outputs | Route decision, Next Action, Owner Assignment |

### 4.2 Lead Routing Decision

| Criteria | Action |
|----------|--------|
| Hot Lead + Large Campaign | Sales Team Lead |
| Hot Lead + Standard Service | Any Available Sales Rep |
| Warm Lead + Clear | Sales Rep |
| Warm Lead + Unclear | Sales Rep (qualification call) |
| Decision Owner | System (auto-route based on score) |
| Escalation | No available rep → Sales Team Lead |

### 4.3 Proposal Approval Decision

| Criteria | Approval |
|----------|----------|
| Standard Proposal ≤ $X | Sales Rep auto-approve |
| Proposal $X-$Y | Sales Team Lead approval |
| Proposal ≥ $Y | Head of Sales approval |
| Custom terms/strategy | Strategy Lead sign-off |
| Decision Owner | Varies by threshold |

### 4.4 Discount Decision

| Criteria | Approval |
|----------|----------|
| Discount ≤ 10% | Sales Rep |
| Discount 10-20% | Sales Team Lead |
| Discount > 20% | Founder/CEO |
| Decision Owner | Varies by % |
| Required Input | Reason, client LTV, competitive context |

### 4.5 Scope Change Decision

| Criteria | Action |
|----------|--------|
| Minor change (≤ 5% effort) | Account Manager approves, logs change |
| Medium change (5-20% effort) | Account Manager + Strategy Lead |
| Major change (> 20% effort) | Founder/CEO approval + Contract amendment |
| Decision Owner | Varies by scope impact |
| Required Input | Change request, effort estimate, cost impact |

### 4.6 Campaign Approval Decision

| Gate | Approver | Criteria |
|------|----------|----------|
| Strategy Approval | Head of Strategy | Aligns with business objectives, insights-driven |
| Internal QC | Production Manager | Meets quality criteria, brand alignment |
| Client Approval | Client | Campaign signed off |
| Launch Approval | Account Manager | All approvals obtained, budget confirmed |

### 4.7 Project Delay Decision

| Delay | Action | Owner |
|-------|--------|-------|
| 1-2 days | Notify Account Manager, adjust sprint | Production Manager |
| 3-5 days | Internal root cause, client communication | Account Manager |
| > 5 days | Escalate to Operations Manager, recovery plan | Operations Manager |
| Root cause: client | Communicate impact, adjust timeline | Account Manager |
| Root cause: internal | Process improvement, team reallocation | Production Manager |

### 4.8 Client Complaint Decision

| Severity | Action | Owner |
|----------|--------|-------|
| Level 1 (Minor) | Account Manager handles directly, log issue |
| Level 2 (Moderate) | Account Manager + Root cause analysis, improvement plan |
| Level 3 (Major) | Account Director + Founder involved, recovery plan |
| All complaints | Tracked in CRM, trend analysis weekly |

### 4.9 Crisis Management Decision

| Scenario | Immediate Action | Owner |
|----------|-----------------|-------|
| Client threatens to leave | Account Director + Founder call within 24h |
| Public reputation issue | Founder + PR response, immediate action |
| Legal/compliance issue | Legal review, Founder decision |
| Major campaign failure | Stop campaign, root cause, client compensation |
| Team member emergency | Operations Manager reallocates resources |

### 4.10 RACI Charts (Key Processes)

**Lead Qualification:**
- R → Sales Rep
- A → Sales Team Lead
- C → Marketing (for source data)
- I → Admin

**Strategy Development:**
- R → Strategic Lead
- A → Head of Strategy
- C → Account Manager, Client
- I → Production Team

**Production Sprint:**
- R → Production Team Members
- A → Production Manager
- C → Strategic Lead (for brief clarity)
- I → Account Manager

**Client Reporting:**
- R → Account Manager
- A → Account Director
- C → Strategy Team (for insights)
- I → Client

---

## 5. Knowledge Base Architecture

### 5.1 SOP Structure (Unified Template)

Every SOP in Mkhtalif must contain exactly 16 sections:

1. **SOP Header** — Name, Code, Department, Owner, Accountable, Version, Last Updated, Related Systems
2. **Purpose** — Why this process exists (prevent blind execution)
3. **Scope** — Trigger (when it starts), Inputs, End Condition, Outputs
4. **Roles & Responsibilities** — RACI matrix
5. **Process Rules** — 5-10 core rules that govern the process
6. **Process Steps** — Numbered steps with actions and outputs
7. **Decision Matrix** — IF/THEN rules for common scenarios
8. **Escalation Rules** — When and how to escalate
9. **Time Standards** — Target time + Maximum SLA per step
10. **Checklist** — Quick execution verification (daily use)
11. **Quality Standards** — What defines success
12. **KPIs** — Success metrics with targets
13. **Common Mistakes** — What NOT to do
14. **Templates & Assets** — Links to forms, scripts, examples
15. **Training (Video Walkthrough)** — Links to Loom/Tella videos
16. **Definition of Success** — When is this process considered complete?

### 5.2 SOP Registry (Complete)

| Code | Name | Department | Owner |
|------|------|------------|-------|
| SOP-SALES-01 | Lead Qualification | Pre-Sales | Sales Team |
| SOP-SALES-02 | Discovery Call/Meeting | Sales | Sales Team |
| SOP-SALES-03 | Proposal Development, Presentation & Follow-up | Sales | Sales Team |
| SOP-SALES-04 | Closing, Contracting & Payment Collection | Sales | Sales Team |
| SOP-OPS-05 | Client Onboarding & Internal Alignment | Operations | Account Manager |
| SOP-STR-06 | Strategic Discovery & Research | Strategy | Strategic Lead |
| SOP-STR-07 | Strategy Development & Planning | Strategy | Strategic Lead |
| SOP-STR-08 | Creative Planning & Briefing | Strategy | Strategic Lead |
| SOP-PROD-09 | Production Sprint & Asset Creation | Production | Production Manager |
| SOP-PROD-10 | Internal Review & Quality Control | Production | Production Manager |
| SOP-PROD-11 | Client Approval & Revisions | Production | Account Manager |
| SOP-PROD-12 | Publishing & Campaign Launch | Production | Production Manager |
| SOP-OPS-13 | Monitoring & Optimization | Operations | Account Manager |
| SOP-OPS-14 | Reporting & Client Review | Operations | Account Manager |
| SOP-CS-15 | Renewal, Upsell & Retention | Client Success | Account Manager |
| SOP-CS-16 | Client Offboarding & File Close | Client Success | Account Manager |

### 5.3 Role Cards

Each role has exactly 3 elements documented:

| Element | Description |
|---------|-------------|
| **What** | What does this role own? (Outcomes, not tasks) |
| **How** | Which SOPs, systems, and tools does this role use? |
| **Success** | Which KPIs define success for this role? |

---

## 6. Database Architecture (PostgreSQL)

### 6.1 Entity Relationship Diagram (Textual)

```
users 1──N team_members N──1 teams
users 1──N activities
users 1──N notifications
users 1──N approvals

roles 1──N role_permissions N──1 permissions
users N──1 roles

leads 1──1 lead_scores
leads 1──N activities
leads 1──1 clients (when won)
leads N──1 users (assigned_to)
leads N──1 pipeline_stages

clients 1──N projects
clients 1──N contracts
clients 1──N invoices

opportunities 1──N proposals
opportunities N──1 clients

meetings N──1 leads
meetings N──1 users

proposals 1──N proposal_sections
proposals N──1 opportunities
proposals N──1 users

contracts 1──1 proposals
contracts N──1 clients

projects 1──N tasks
projects 1──N deliverables
projects 1──N campaigns
projects N──1 clients
projects N──1 teams

tasks N──1 users (assigned_to)
tasks N──1 projects
tasks 1──N task_dependencies

deliverables 1──N approvals
deliverables N──1 projects
deliverables N──1 users

campaigns N──1 projects
campaigns 1──N campaign_metrics
campaigns 1──N campaign_assets

approvals N──1 deliverables
approvals N──1 users (approver)
approvals N──1 approval_gates

sops 1──N sop_versions
sops N──1 departments
sops 1──N sop_steps
sops 1──N sop_checklists

knowledge_articles N──N sops
knowledge_articles N──N templates
knowledge_articles N──N departments

templates 1──N template_assets

kpis N──1 departments
kpis N──1 dashboards
kpis 1──N kpi_values

dashboards 1──N dashboard_widgets
dashboards N──1 users

invoices N──1 clients
invoices 1──N invoice_items
invoices N──1 payment_statuses

payments N──1 invoices

notifications N──1 users

auto_actions 1──N automation_rules
automation_rules N──N auto_triggers
automation_rules 1──N auto_conditions
automation_rules 1──N auto_actions
```

### 6.2 Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id),
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department_id);
```

**roles**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'sales_rep', 'account_manager'
  description TEXT,
  level INTEGER NOT NULL, -- 1-4 (decision level)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**permissions**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource VARCHAR(100) NOT NULL, -- e.g., 'lead', 'proposal', 'project'
  action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'approve'
  description TEXT,
  CONSTRAINT uk_resource_action UNIQUE (resource, action)
);
```

**role_permissions**
```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

**departments**
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'growth', 'sales', 'cs', 'strategy', 'production', 'ops'
  head_user_id UUID REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**teams**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id),
  lead_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**team_members**
```sql
CREATE TABLE team_members (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role_in_team VARCHAR(50), -- 'lead', 'member', 'support'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, team_id)
);
```

**leads**
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'website', 'whatsapp', 'referral', 'call', 'other'
  service_type VARCHAR(50), -- 'single_service', 'multi_service', 'full_campaign', 'unknown'
  clarity_level VARCHAR(20), -- 'low', 'medium', 'high'
  budget_level VARCHAR(20), -- 'unknown', 'low', 'medium', 'high'
  opportunity_size VARCHAR(20), -- 'small', 'medium', 'large'
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 10),
  lead_temperature VARCHAR(10) CHECK (lead_temperature IN ('hot', 'warm', 'cold')),
  stage_id UUID REFERENCES pipeline_stages(id),
  assigned_to UUID REFERENCES users(id),
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  proposal_sent BOOLEAN DEFAULT false,
  deal_value DECIMAL(12,2),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'archived')),
  lost_reason TEXT,
  lost_reason_category VARCHAR(50),
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_stage ON leads(stage_id);
CREATE INDEX idx_leads_score ON leads(lead_score);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at);
```

**pipeline_stages**
```sql
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'new_lead', 'qualification', 'qualified', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost', 'archive'
  stage_order INTEGER NOT NULL,
  probability_default INTEGER DEFAULT 0,
  color VARCHAR(7), -- hex color
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**activities**
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL, -- 'call', 'message', 'meeting', 'follow_up', 'email', 'note', 'system'
  description TEXT,
  outcome TEXT,
  next_step TEXT,
  metadata JSONB, -- flexible extra data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at);
```

**clients**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  website TEXT,
  industry VARCHAR(100),
  account_manager_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'at_risk', 'churned', 'archived')),
  satisfaction_score INTEGER,
  lifetime_value DECIMAL(14,2),
  acquired_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**opportunities**
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(12,2),
  stage VARCHAR(50) DEFAULT 'discovery',
  probability INTEGER,
  expected_close_date TIMESTAMPTZ,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**meetings**
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  type VARCHAR(20) CHECK (type IN ('qualification_call', 'discovery_call', 'discovery_meeting', 'proposal_presentation', 'kickoff', 'review')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  recording_url TEXT,
  outcome TEXT,
  next_step TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**proposals**
```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id),
  client_id UUID REFERENCES clients(id),
  title VARCHAR(255) NOT NULL,
  version VARCHAR(10) DEFAULT 'v1.0',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'internal_review', 'sent', 'presented', 'accepted', 'rejected', 'revision')),
  technical_content TEXT,
  financial_content TEXT,
  scope_of_work JSONB, -- {included: [], excluded: [], deliverables: [], revision_limits, timeline, client_responsibilities}
  expectations TEXT,
  total_value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'LYD',
  validity_days INTEGER DEFAULT 7,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**contracts**
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id),
  client_id UUID REFERENCES clients(id),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'active', 'completed', 'terminated')),
  scope_of_work JSONB,
  start_date DATE,
  end_date DATE,
  total_value DECIMAL(12,2),
  payment_terms TEXT,
  special_terms TEXT,
  signed_at TIMESTAMPTZ,
  signed_by_client_at TIMESTAMPTZ,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**projects**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  contract_id UUID REFERENCES contracts(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'strategy', 'production', 'active', 'on_hold', 'completed', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  account_manager_id UUID REFERENCES users(id),
  strategic_lead_id UUID REFERENCES users(id),
  production_manager_id UUID REFERENCES users(id),
  budget DECIMAL(12,2),
  hourly_rate DECIMAL(8,2),
  estimated_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_am ON projects(account_manager_id);
```

**tasks**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50), -- 'design', 'copy', 'video', 'ads', 'research', 'review', 'approval'
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'approved', 'delivered', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  estimated_hours DECIMAL(6,2),
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sprint_id UUID,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
```

**sprints**
```sql
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'review', 'completed')),
  goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**deliverables**
```sql
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'design', 'video', 'copy', 'ad', 'report', 'brief', 'other'
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'internal_review', 'client_review', 'approved', 'rejected', 'published', 'archived')),
  file_url TEXT,
  version INTEGER DEFAULT 1,
  revision_count INTEGER DEFAULT 0,
  max_revisions INTEGER DEFAULT 3,
  submitted_for_review_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**approvals**
```sql
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES deliverables(id),
  approver_id UUID REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('internal_qc', 'strategy_alignment', 'client_approval')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  comments TEXT,
  decision_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**campaigns**
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  objective VARCHAR(100), -- 'awareness', 'lead_gen', 'conversion', 'retention'
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')),
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  channels JSONB, -- ['instagram', 'facebook', 'google', 'tiktok', 'email']
  target_audience JSONB,
  kpi_targets JSONB, -- {ctr: X, cpm: Y, cpl: Z}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**campaign_metrics**
```sql
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2),
  cpm DECIMAL(8,2),
  spend DECIMAL(10,2),
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(8,2),
  revenue DECIMAL(12,2),
  roas DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_campaign_date UNIQUE (campaign_id, date)
);
```

**sops**
```sql
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'SOP-SALES-01'
  name VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES departments(id),
  owner_role_id UUID REFERENCES roles(id),
  accountable_role_id UUID REFERENCES roles(id),
  purpose TEXT NOT NULL,
  trigger TEXT,
  input TEXT,
  output TEXT,
  steps JSONB, -- [{step_number, action, output}]
  decision_matrix JSONB, -- [{condition, action}]
  escalation_rules JSONB,
  time_standards JSONB,
  quality_standards TEXT,
  common_mistakes TEXT,
  success_definition TEXT,
  version VARCHAR(10) DEFAULT 'v1.0',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**sop_checklists**
```sql
CREATE TABLE sop_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES sops(id) ON DELETE CASCADE,
  section VARCHAR(50), -- 'before', 'during', 'after'
  item TEXT NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**knowledge_articles**
```sql
CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  article_type VARCHAR(50), -- 'sop', 'checklist', 'template', 'guide', 'faq', 'case_study'
  department_id UUID REFERENCES departments(id),
  sop_id UUID REFERENCES sops(id),
  tags TEXT[], -- for search
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_kb_tags ON knowledge_articles USING GIN(tags);
CREATE INDEX idx_kb_type ON knowledge_articles(article_type);
CREATE INDEX idx_kb_search ON knowledge_articles USING GIN(to_tsvector('arabic', content));
```

**templates**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'proposal', 'contract', 'brief', 'report', 'script', 'form', 'email'
  content TEXT,
  file_url TEXT,
  category VARCHAR(100),
  department_id UUID REFERENCES departments(id),
  version VARCHAR(10) DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**kpis**
```sql
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'marketing', 'sales', 'cs', 'strategy', 'production', 'operations', 'finance', 'executive'
  formula TEXT,
  unit VARCHAR(50), -- 'percentage', 'count', 'currency', 'hours', 'days', 'score'
  target_value DECIMAL(12,2),
  target_comparison VARCHAR(10) CHECK (target_comparison IN ('gte', 'lte', 'eq')),
  data_source VARCHAR(100), -- table/query reference
  update_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'quarterly'
  department_id UUID REFERENCES departments(id),
  dashboard_id UUID REFERENCES dashboards(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**kpi_values**
```sql
CREATE TABLE kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
  value DECIMAL(14,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_kpi_values_kpi ON kpi_values(kpi_id);
CREATE INDEX idx_kpi_values_period ON kpi_values(period_start, period_end);
```

**dashboards**
```sql
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'executive', 'sales', 'marketing', 'production', 'finance', 'client'
  owner_id UUID REFERENCES users(id),
  config JSONB, -- layout, widget positions
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**invoices**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  contract_id UUID REFERENCES contracts(id),
  client_id UUID REFERENCES clients(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  total_amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'LYD',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_method VARCHAR(50),
  reference TEXT,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  type VARCHAR(50), -- 'task_assigned', 'follow_up', 'approval', 'payment', 'alert', 'system'
  reference_type VARCHAR(50), -- 'lead', 'task', 'proposal', 'invoice'
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
```

**automation_rules**
```sql
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'event', 'schedule', 'condition'
  trigger_config JSONB, -- event name, schedule cron, condition expression
  conditions JSONB, -- [{field, operator, value}]
  actions JSONB NOT NULL, -- [{type, config}]
  is_active BOOLEAN DEFAULT true,
  error_handling JSONB, -- escalation on failure
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. User Roles & Permission Matrix

### 7.1 Role Definitions

| Role Code | Role Name | Level | Decision Level |
|-----------|-----------|-------|----------------|
| `su` | Super Admin | System | All |
| `ceo` | Founder/CEO | Executive | 4 |
| `hos` | Head of Sales | Department | 3 |
| `stl` | Sales Team Lead | Management | 2 |
| `sr` | Sales Rep | Operational | 1 |
| `hod` | Head of Strategy | Department | 3 |
| `strl` | Strategic Lead | Management | 2-3 |
| `strat` | Strategist | Operational | 1-2 |
| `ad` | Account Director | Management | 3 |
| `am` | Account Manager | Operational | 2 |
| `pm` | Production Manager | Management | 2-3 |
| `des` | Designer | Operational | 1 |
| `vid` | Video Editor | Operational | 1 |
| `cw` | Copywriter | Operational | 1 |
| `mb` | Media Buyer | Operational | 1-2 |
| `om` | Operations Manager | Department | 3 |
| `ops` | Operations Staff | Operational | 1 |
| `fin` | Finance Officer | Operational | 2 |
| `admin` | Admin | Operational | 1 |

### 7.2 Permission Matrix (Core Resources)

| Resource | su | ceo | hos | stl | sr | hod | strl | strat | ad | am | pm | des | vid | cw | mb | om | fin | admin |
|----------|:--:|:---:|:---:|:---:|:--:|:---:|:----:|:-----:|:--:|:--:|:--:|:---:|:---:|:--:|:--:|:--:|:---:|:-----:|
| **Leads** | CRUD | R | CRUD | CRUD | CRU | R | R | - | R | R | - | - | - | - | - | R | - | CRUD |
| **Clients** | CRUD | CRUD | CRUD | CRUD | CRU | CRUD | CRU | CRU | CRUD | CRUD | CRU | R | R | R | CRU | CRUD | CRU | CRUD |
| **Opportunities** | CRUD | R | CRUD | CRUD | CRU | R | CRU | CRU | CRU | CRU | R | - | - | - | - | R | R | CRUD |
| **Proposals** | CRUD | R | CRUD | CRU | CRU | CRU | CRU | CRU | CRU | CRU | - | - | - | - | - | R | R | CRUD |
| **Contracts** | CRUD | A | CRUD | CRU | CRU | R | R | - | CRU | CRU | - | - | - | - | - | R | CRU | CRUD |
| **Projects** | CRUD | CRUD | R | R | - | CRU | CRU | CRU | CRUD | CRUD | CRUD | R | R | R | R | CRUD | R | CRUD |
| **Tasks** | CRUD | R | R | - | - | R | CRU | CRU | CRUD | CRUD | CRUD | CRU | CRU | CRU | CRU | R | - | CRUD |
| **Deliverables** | CRUD | R | - | - | - | CRU | CRU | CRU | CRUD | CRUD | CRUD | CRU | CRU | CRU | CRU | R | - | - |
| **Campaigns** | CRUD | CRUD | R | - | - | CRUD | CRU | CRU | CRU | CRU | CRU | R | R | R | CRUD | R | R | - |
| **SOPs** | CRUD | CRUD | CRU | - | - | CRU | CRU | CRU | CRU | CRU | CRU | - | - | - | - | CRUD | - | CRU |
| **KPIs** | CRUD | CRUD | CRU | - | - | CRU | CRU | - | CRU | - | CRU | - | - | - | - | CRUD | CRU | - |
| **Invoices** | CRUD | CRUD | R | - | - | - | - | - | R | R | - | - | - | - | - | R | CRUD | CRU |
| **Payments** | CRUD | CRUD | R | - | - | - | - | - | R | R | - | - | - | - | - | R | CRUD | CRU |
| **Users** | CRUD | CRUD | - | - | - | - | - | - | - | - | - | - | - | - | - | CRU | - | CRU |
| **Reports** | CRUD | CRUD | CRUD | CRU | CRU | CRUD | CRUD | CRU | CRUD | CRUD | CRUD | R | R | R | CRU | CRUD | CRUD | CRU |
| **Automation** | CRUD | A | CRU | - | - | - | - | - | - | - | - | - | - | - | - | CRUD | - | - |

**Legend:** C=Create, R=Read, U=Update, D=Delete, A=Approve, -=No Access

---

## 8. KPI Framework

### 8.1 Marketing KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| Cost per Lead (CPL) | Total Ad Spend / Leads Generated | Varies by channel | Campaign Metrics | Weekly | Marketing |
| Lead Volume | Count of new leads | Per channel target | Leads | Daily | Marketing |
| Lead by Source % | (Leads by Source / Total Leads) × 100 | Balanced portfolio | Leads | Weekly | Marketing |
| Response Time | Average time from lead creation to first response | < 10 min | Activities | Daily | Marketing |
| Content Engagement Rate | (Engagements / Impressions) × 100 | > 3% | Social Platforms | Weekly | Marketing |
| CTR | (Clicks / Impressions) × 100 | > 1% | Campaign Metrics | Weekly | Marketing |

### 8.2 Sales KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| Lead → Meeting % | (Meetings Booked / Qualified Leads) × 100 | > 40% | Leads + Meetings | Weekly | Sales |
| Meeting → Proposal % | (Proposals Sent / Meetings Completed) × 100 | > 70% | Meetings + Proposals | Weekly | Sales |
| Proposal → Close % | (Deals Won / Proposals Sent) × 100 | Varies by service | Proposals | Weekly | Sales |
| Close Rate | (Deals Won / Total Opportunities) × 100 | Tracking | Opportunities | Monthly | Sales |
| Revenue (Won) | Sum of won deal values | Per period target | Leads | Monthly | Sales |
| Sales Cycle Time | Avg days from Lead → Won | < 30 days | Leads | Monthly | Sales |
| Average Deal Size | Total Revenue / Number of Won Deals | Growing | Leads | Monthly | Sales |
| Lead Response Time | Avg time to first response | < 10 min | Activities | Daily | Sales |
| Follow-up Compliance | (Follow-ups Completed / Required) × 100 | 100% | Activities | Weekly | Sales |

### 8.3 Customer Success KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| Client Satisfaction (CSAT) | Survey score (1-10) | > 8 | Surveys | Monthly | CS |
| Net Promoter Score (NPS) | % Promoters - % Detractors | > 50 | Surveys | Quarterly | CS |
| Time to Kickoff | Days from contract to kickoff | < 5 days | Projects | Per project | CS |
| Onboarding Completion % | (Onboarding Complete / Total New Clients) × 100 | 100% | Projects | Monthly | CS |
| Retention Rate | (Clients Retained / Total Clients) × 100 | > 85% | Clients | Monthly | CS |
| Churn Rate | (Clients Churned / Total Clients) × 100 | < 5% | Clients | Monthly | CS |
| Access Collection Rate | (Accesses Collected / Required) × 100 | 100% | Projects | Per project | CS |
| Response SLA Compliance | (Responses within SLA / Total Inquiries) × 100 | > 95% | Communications | Weekly | CS |

### 8.4 Strategy KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| Brief Clarity Score | Internal team survey | > 8/10 | Team feedback | Per project | Strategy |
| Strategy Win Rate | (Strategies achieving targets / Total Strategies) × 100 | > 70% | Campaign Metrics | Monthly | Strategy |
| Research Completion % | (Research completed on time / Total) × 100 | 100% | Projects | Per project | Strategy |
| Approval Rate (Internal) | (Briefs approved first round / Total) × 100 | > 80% | Approvals | Per project | Strategy |

### 8.5 Production KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| On-Time Delivery % | (Tasks delivered on time / Total) × 100 | > 90% | Tasks | Weekly | Production |
| Sprint Completion Rate | (Sprint tasks completed / Total sprint tasks) × 100 | > 85% | Tasks | Weekly | Production |
| Revision Rate | (Total Revisions / Total Deliverables) | < 2 per asset | Deliverables | Weekly | Production |
| Quality Score | Internal QC approval rate | > 85% | Approvals | Weekly | Production |
| Production Velocity | Deliverables produced per week | Per team target | Deliverables | Weekly | Production |
| Task Backlog Age | Avg days tasks stay in backlog | < 3 days | Tasks | Weekly | Production |

### 8.6 Operations KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| SOP Compliance % | (SOPs followed correctly / Total checks) × 100 | > 90% | Audits | Monthly | Operations |
| CRM Update Compliance | (Leads updated after interaction / Total interactions) × 100 | 100% | Activities | Weekly | Operations |
| Data Completeness % | (Leads with all mandatory fields / Total) × 100 | 100% | Leads | Weekly | Operations |
| Automation Success Rate | (Automations completed / Total triggered) × 100 | > 95% | Automation Logs | Weekly | Operations |
| Team Utilization % | (Billable hours / Total available hours) × 100 | > 75% | Tasks | Monthly | Operations |

### 8.7 Finance KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| Revenue | Total invoiced amount | Per period target | Invoices | Monthly | Finance |
| Profit Margin | (Revenue - Costs) / Revenue × 100 | > 30% | Finance | Monthly | Finance |
| Days Sales Outstanding (DSO) | Avg days to collect payment | < 15 days | Payments | Monthly | Finance |
| Payment Collection Rate | (Payments received / Amount due) × 100 | > 95% | Payments | Monthly | Finance |
| Cash Flow | Cash in - Cash out | Positive | Finance | Weekly | Finance |
| AR Aging | % of invoices by age buckets | < 5% overdue | Invoices | Weekly | Finance |
| Budget Adherence | (Actual spend / Budgeted) × 100 | 90-110% | Campaigns | Monthly | Finance |

### 8.8 Executive KPIs

| KPI | Formula | Target | Data Source | Frequency | Dashboard |
|-----|---------|--------|-------------|-----------|-----------|
| Monthly Recurring Revenue (MRR) | Sum of monthly retainer revenue | Growing | Contracts | Monthly | Executive |
| Revenue Growth % | ((Current Period - Prior Period) / Prior Period) × 100 | > 20% YoY | Invoices | Monthly | Executive |
| Client Acquisition Cost (CAC) | Total Sales & Marketing Cost / New Clients | Decreasing | Finance | Monthly | Executive |
| Lifetime Value (LTV) | Avg Revenue per Client × Avg Retention Period | > 3× CAC | Clients | Quarterly | Executive |
| LTV:CAC Ratio | LTV / CAC | > 3:1 | Calculation | Quarterly | Executive |
| Active Projects | Count of active projects | Tracking | Projects | Daily | Executive |
| At-Risk Clients | Clients with satisfaction < 7 or late payments | < 10% | Clients | Weekly | Executive |
| Team Size | Total active employees | Per plan | Users | Monthly | Executive |
| Revenue per Employee | Total Revenue / Total Employees | Growing | Calculation | Monthly | Executive |

---

## 9. Automation Architecture

### 9.1 Automation Register

| # | Automation Name | Trigger | Conditions | Actions | Escalation |
|---|-----------------|---------|------------|---------|------------|
| A01 | Lead Assignment | Lead created with score ≥ 5 | Lead has no owner | Assign to least busy Sales Rep, notify assignee | No available rep → notify Sales Lead |
| A02 | Hot Lead Alert | Lead score updated to ≥ 8 | - | Notify Sales Lead, create urgent task "Call within 1h" | No response in 1h → notify Head of Sales |
| A03 | Welcome Sequence | Lead status = New | - | Send qualification script via WhatsApp/Email, create CRM activity | - |
| A04 | Meeting Reminder | Meeting created | Scheduled_at > now | Notify Sales Rep 1h before, notify client 2h before | Client no-show → trigger follow-up task |
| A05 | Follow-up Sequence | Proposal sent | - | Create activities: Day 1, Day 3, Day 7 tasks | No response Day 7 → change status to Lost, notify Sales Lead |
| A06 | Proposal Follow-up Day 1 | Proposal sent + 24h | - | Send follow-up message, create activity | - |
| A07 | Proposal Follow-up Day 3 | Proposal sent + 72h | No response | Send second follow-up, update probability | - |
| A08 | Proposal Follow-up Day 7 | Proposal sent + 7d | No response | Send final follow-up, set status to Lost, require reason | - |
| A09 | Onboarding Trigger | Lead status = Won | Payment confirmed | Create Client record, assign Account Manager, send Welcome Pack, create onboarding tasks | No Account Manager assigned → notify Ops Manager |
| A10 | Welcome Pack | Client created | - | Send Welcome Message, send Welcome Pack link, schedule Kickoff | - |
| A11 | Access Collection Reminder | Onboarding started | No accesses collected in 48h | Notify Account Manager, send reminder to client | 5 days no response → escalate to Account Director |
| A12 | Onboarding Gate Check | All onboarding tasks complete | - | Update project status to "Ready for Strategy", notify Strategy Lead | Missing items → notify Account Manager |
| A13 | Sprint Creation | Project status = Strategy Complete | - | Create first sprint with tasks from Creative Brief, assign team | No team members → notify Production Manager |
| A14 | Task Overdue Alert | Task deadline passed | Status ≠ completed | Notify assignee, notify Production Manager | 2 days overdue → notify Account Manager |
| A15 | Approval Request | Deliverable status = Internal Review | - | Notify approver, create approval record | No response in 24h → send reminder, 48h → escalate |
| A16 | Client Approval Reminder | Deliverable status = Client Review | - | Notify client via preferred channel | 48h no response → notify Account Manager to follow up |
| A17 | Campaign Launch Gate | All approvals obtained | - | Schedule campaign posts, notify Account Manager, create monitoring tasks | Missing approvals → block launch |
| A18 | Weekly Report Generation | Every Monday 9am | Project is active | Compile performance data, generate report, notify Account Manager | Data missing → flag in report |
| A19 | Monthly Client Review | First of month | Client has active project | Generate monthly report, schedule review meeting, send to client | No engagement → flag as risk |
| A20 | Invoice Generation | Contract signed | - | Generate first invoice, send to client, set due date | - |
| A21 | Payment Reminder Day 1 | Invoice sent + 24h | Status = sent | Notify client about payment | - |
| A22 | Payment Reminder Day 3 | Invoice sent + 72h | Status ≠ paid | Send reminder with late fee notice | - |
| A23 | Payment Overdue Alert | Due date passed | Status ≠ paid | Notify Account Manager, flag payment in dashboard | 7 days overdue → escalate to Finance |
| A24 | Payment Confirmed | Payment received | - | Update invoice status, notify Account Manager, trigger next phase | - |
| A25 | Renewal Reminder | Contract end date - 60 days | - | Notify Account Manager to start renewal process | - |
| A26 | Client Churn Risk | No activity for 14 days | Client status = active | Flag client as at-risk, notify Account Manager | 30 days → notify Account Director |
| A27 | KPI Alert | KPI value entered | Value < threshold (red) | Notify department head, create improvement task | - |
| A28 | Daily Digests | Daily 8am | User is active | Send summary of: new tasks, overdue items, new leads | - |
| A29 | Lost Reason Collection | Lead status = Lost | - | Require lost reason + category input | Empty reason → block status change |
| A30 | Lead Stale Alert | Last contact > 7 days | Lead status = open | Notify assigned Sales Rep, flag in CRM | 14 days → auto-reassign or archive |

### 9.2 Automation Categories

| Category | Count | Priority |
|----------|-------|----------|
| Lead Management | 4 (A01-A04) | High |
| Follow-up & Proposals | 4 (A05-A08) | High |
| Onboarding | 4 (A09-A12) | High |
| Production & Tasks | 3 (A13-A15) | High |
| Client Communication | 3 (A16-A18) | Medium |
| Reporting | 2 (A19-A20) | Medium |
| Finance & Invoicing | 6 (A21-A26) | High |
| Alerts & Monitoring | 4 (A27-A30) | Medium |

---

## 10. API Architecture

### 10.1 General Design

- **Protocol:** REST over HTTPS
- **Base URL:** `/api/v1`
- **Authentication:** JWT (Bearer token), 24h expiry
- **Authorization:** RBAC (Role-Based Access Control)
- **Content-Type:** `application/json`
- **Pagination:** Cursor-based for lists (`?cursor=xxx&limit=20`)
- **Filtering:** Query params (`?status=won&source=instagram`)
- **Sorting:** `?sort=created_at&order=desc`
- **Webhooks:** Outbound for integrations (Zapier, webhook relay)

### 10.2 Endpoint Specifications (Core)

#### Authentication
```
POST   /api/v1/auth/login          { email, password } → { token, user }
POST   /api/v1/auth/register       { ...user } → { token, user }
POST   /api/v1/auth/refresh        { refreshToken } → { token }
POST   /api/v1/auth/logout
GET    /api/v1/auth/me             → { user, permissions }
```

#### Users
```
GET    /api/v1/users                → { users[] }
GET    /api/v1/users/:id            → { user }
PATCH  /api/v1/users/:id            → { user }
DELETE /api/v1/users/:id
GET    /api/v1/users/me/notifications → { notifications[] }
PATCH  /api/v1/users/me/notifications/:id/read → { notification }
```

#### Roles
```
GET    /api/v1/roles                → { roles[] }
POST   /api/v1/roles                → { role }
PATCH  /api/v1/roles/:id            → { role }
DELETE /api/v1/roles/:id
GET    /api/v1/roles/:id/permissions → { permissions[] }
PUT    /api/v1/roles/:id/permissions → { role_permissions }
```

#### Leads
```
GET    /api/v1/leads                → { leads[], pagination }
GET    /api/v1/leads/:id            → { lead, activities, meetings }
POST   /api/v1/leads                → { lead }
PATCH  /api/v1/leads/:id            → { lead }
DELETE /api/v1/leads/:id
POST   /api/v1/leads/:id/score      → { lead_score, temperature }
PATCH  /api/v1/leads/:id/assign     → { lead }
PATCH  /api/v1/leads/:id/stage      → { lead }
POST   /api/v1/leads/:id/activities → { activity }
GET    /api/v1/leads/stats          → { by_source, by_stage, by_temperature }
```

#### Clients
```
GET    /api/v1/clients              → { clients[] }
GET    /api/v1/clients/:id          → { client, projects, contracts }
POST   /api/v1/clients              → { client }
PATCH  /api/v1/clients/:id          → { client }
GET    /api/v1/clients/:id/projects → { projects[] }
GET    /api/v1/clients/:id/invoices → { invoices[] }
```

#### Opportunities
```
GET    /api/v1/opportunities        → { opportunities[] }
POST   /api/v1/opportunities        → { opportunity }
PATCH  /api/v1/opportunities/:id    → { opportunity }
```

#### Proposals
```
GET    /api/v1/proposals            → { proposals[] }
GET    /api/v1/proposals/:id        → { proposal, sections }
POST   /api/v1/proposals            → { proposal }
PATCH  /api/v1/proposals/:id        → { proposal }
POST   /api/v1/proposals/:id/send   → { proposal }
POST   /api/v1/proposals/:id/approve → { proposal }
POST   /api/v1/proposals/:id/reject → { proposal }
```

#### Contracts
```
GET    /api/v1/contracts            → { contracts[] }
POST   /api/v1/contracts            → { contract }
PATCH  /api/v1/contracts/:id        → { contract }
POST   /api/v1/contracts/:id/sign   → { contract }
GET    /api/v1/contracts/:id/pdf    → (file download)
```

#### Projects
```
GET    /api/v1/projects             → { projects[], pagination }
GET    /api/v1/projects/:id         → { project, tasks, deliverables }
POST   /api/v1/projects             → { project }
PATCH  /api/v1/projects/:id         → { project }
GET    /api/v1/projects/:id/tasks   → { tasks[] }
GET    /api/v1/projects/:id/sprints → { sprints[] }
GET    /api/v1/projects/:id/report  → { report }
```

#### Tasks
```
GET    /api/v1/tasks                → { tasks[] }
POST   /api/v1/tasks                → { task }
PATCH  /api/v1/tasks/:id            → { task }
PATCH  /api/v1/tasks/:id/status     → { task }
POST   /api/v1/tasks/batch          → { tasks[] } (batch create)
```

#### Sprints
```
GET    /api/v1/sprints              → { sprints[] }
POST   /api/v1/sprints              → { sprint }
PATCH  /api/v1/sprints/:id          → { sprint }
PATCH  /api/v1/sprints/:id/start    → { sprint }
PATCH  /api/v1/sprints/:id/complete → { sprint }
```

#### Deliverables
```
GET    /api/v1/deliverables         → { deliverables[] }
POST   /api/v1/deliverables         → { deliverable }
PATCH  /api/v1/deliverables/:id     → { deliverable }
POST   /api/v1/deliverables/:id/submit → { deliverable }
GET    /api/v1/deliverables/:id/file → (file download)
```

#### Approvals
```
GET    /api/v1/approvals            → { approvals[] }
POST   /api/v1/approvals            → { approval }
PATCH  /api/v1/approvals/:id/approve → { approval }
PATCH  /api/v1/approvals/:id/reject → { approval }
GET    /api/v1/approvals/pending    → { approvals[] }
```

#### Campaigns
```
GET    /api/v1/campaigns            → { campaigns[] }
POST   /api/v1/campaigns            → { campaign }
PATCH  /api/v1/campaigns/:id        → { campaign }
PATCH  /api/v1/campaigns/:id/launch → { campaign }
PATCH  /api/v1/campaigns/:id/pause  → { campaign }
GET    /api/v1/campaigns/:id/metrics → { metrics[] }
```

#### SOPs
```
GET    /api/v1/sops                 → { sops[] }
GET    /api/v1/sops/:id             → { sop, checklists }
POST   /api/v1/sops                 → { sop }
PATCH  /api/v1/sops/:id             → { sop }
PATCH  /api/v1/sops/:id/publish    → { sop }
```

#### Knowledge Base
```
GET    /api/v1/knowledge            → { articles[] }
GET    /api/v1/knowledge/:id        → { article }
POST   /api/v1/knowledge            → { article }
PATCH  /api/v1/knowledge/:id        → { article }
GET    /api/v1/knowledge/search?q=  → { articles[] }
```

#### KPIs
```
GET    /api/v1/kpis                 → { kpis[] }
POST   /api/v1/kpis                 → { kpi }
PATCH  /api/v1/kpis/:id             → { kpi }
GET    /api/v1/kpis/:id/values      → { values[] }
POST   /api/v1/kpis/:id/values      → { value }
GET    /api/v1/dashboards           → { dashboards[] }
GET    /api/v1/dashboards/:id       → { dashboard, widgets }
```

#### Invoices
```
GET    /api/v1/invoices             → { invoices[] }
POST   /api/v1/invoices             → { invoice }
PATCH  /api/v1/invoices/:id         → { invoice }
POST   /api/v1/invoices/:id/send    → { invoice }
POST   /api/v1/invoices/:id/remind  → { invoice }
```

#### Payments
```
GET    /api/v1/payments             → { payments[] }
POST   /api/v1/payments             → { payment }
PATCH  /api/v1/payments/:id         → { payment }
```

#### Automation
```
GET    /api/v1/automations          → { rules[] }
POST   /api/v1/automations          → { rule }
PATCH  /api/v1/automations/:id      → { rule }
POST   /api/v1/automations/:id/test → { result }
GET    /api/v1/automations/:id/logs → { logs[] }
```

#### Reports
```
GET    /api/v1/reports/sales        → { report }
GET    /api/v1/reports/production   → { report }
GET    /api/v1/reports/finance      → { report }
GET    /api/v1/reports/executive    → { report }
GET    /api/v1/reports/client/:id   → { report }
```

#### Notifications
```
GET    /api/v1/notifications        → { notifications[] }
PATCH  /api/v1/notifications/:id/read → {}
POST   /api/v1/notifications/read-all → {}
GET    /api/v1/notifications/unread-count → { count }
```

### 10.3 Webhook Events

```
lead.created
lead.scored
lead.stage_changed
lead.assigned
lead.won
lead.lost

meeting.created
meeting.completed

proposal.sent
proposal.accepted
proposal.rejected

contract.signed
contract.completed

payment.received
payment.overdue

task.created
task.completed
task.overdue

deliverable.submitted
deliverable.approved
deliverable.rejected

project.status_changed
project.completed

kpi.threshold_breached
```

---

## 11. UI/UX Design

### 11.1 Application Sitemap

```
┌─ Dashboard (Executive)
│  ├─ KPI Overview
│  ├─ Revenue Chart
│  ├─ Active Projects
│  ├─ At-Risk Clients
│  └─ Alerts Feed
│
├─ CRM
│  ├─ Lead Pipeline (Kanban)
│  ├─ Lead Detail
│  ├─ Activity Log
│  ├─ Lead Scoring
│  └─ Saved Filters
│
├─ Sales
│  ├─ Opportunities
│  ├─ Proposals
│  │  ├─ Create Proposal (Wizard)
│  │  └─ Proposal Detail
│  ├─ Meetings
│  ├─ Contracts
│  └─ Sales Dashboard
│
├─ Projects
│  ├─ Project List
│  ├─ Project Detail
│  │  ├─ Overview
│  │  ├─ Tasks (Kanban)
│  │  ├─ Sprints
│  │  ├─ Deliverables
│  │  ├─ Campaigns
│  │  └─ Reports
│  └─ Project Dashboard
│
├─ Strategy
│  ├─ Research Reports
│  ├─ Strategic Blueprints
│  ├─ Creative Briefs
│  ├─ Competitor Analysis
│  └─ Audience Research
│
├─ Production
│  ├─ Sprint Board
│  ├─ Task List
│  ├─ Asset Library
│  ├─ QC Review Queue
│  └─ Production Dashboard
│
├─ Client Portal
│  ├─ Dashboard
│  ├─ Project Progress
│  ├─ Deliverables
│  ├─ Reports
│  ├─ Approvals
│  ├─ Communication
│  └─ Invoices
│
├─ Finance
│  ├─ Invoices
│  ├─ Payments
│  ├─ Profitability
│  ├─ Cash Flow
│  └─ Finance Dashboard
│
├─ Knowledge Base
│  ├─ SOPs
│  ├─ Checklists
│  ├─ Templates
│  ├─ Videos
│  └─ Search
│
├─ Operations
│  ├─ KPIs
│  ├─ Dashboards
│  ├─ Automation Rules
│  ├─ Team
│  └─ Reports
│
├─ HR
│  ├─ Team Members
│  ├─ Roles
│  ├─ Performance
│  └─ Onboarding
│
└─ Settings
   ├─ Profile
   ├─ Company
   ├─ Roles & Permissions
   ├─ Pipeline Stages
   ├─ Integrations
   ├─ Notifications
   └─ Billing
```

### 11.2 Navigation Structure

**Main Sidebar (Departments):**
```
Mkhtalif [Logo]
│
├─ Dashboard
├─ CRM
│  ├─ Pipeline
│  └─ Leads
├─ Sales
│  ├─ Proposals
│  ├─ Contracts
│  └─ Meetings
├─ Projects
│  ├─ Active
│  ├─ All Projects
│  └─ Sprints
├─ Strategy
│  ├─ Research
│  └─ Briefs
├─ Production
│  ├─ Board
│  └─ Assets
├─ Knowledge Base
├─ Finance
├─ Operations
│  ├─ KPIs
│  └─ Automation
└─ Settings
```

**Top Bar:**
```
[Search]  [Notifications 🔔]  [User Avatar ▼]
```

**Client Portal Navigation:**
```
[Logo] | Dashboard | Progress | Deliverables | Reports | Approvals | Invoices | Profile
```

### 11.3 Key Screen Descriptions

#### Executive Dashboard
- Top row: 4 big-number cards (Revenue, Active Projects, New Clients, At-Risk %)
- Left column: Revenue chart (6-month trend)
- Center: Project status breakdown (donut chart)
- Right: Alerts feed (overdue tasks, unpaid invoices, at-risk clients)
- Bottom row: Team members online, recent activities feed
- Strategy: "Know company status in 5 minutes"

#### Lead Pipeline (Kanban)
- Columns: New Lead → Qualification → Qualified → Meeting Scheduled → Proposal Sent → Negotiation → Won/Lost/Archive
- Cards show: Client name, score badge (Hot 🔥/Warm/❄️), source, time since entry, next action
- Drag-and-drop between stages
- Click card → opens lead detail slide-over
- Top filter bar: Source, Score Range, Assigned To, Date Range

#### Lead Detail
- Header: Client name, score, temperature, stage, owner
- Tabs: Details, Activities, Meetings, Notes, History
- Details tab: Full form with all scoring criteria, contact info, source
- Activities tab: Timeline of all interactions (calls, messages, meetings)
- Right sidebar: Quick actions (Schedule Meeting, Send Proposal, Change Stage, Assign)
- Bottom: Next Action with due date picker

#### Proposal Creator (Wizard)
- Step 1: Select Client + Opportunity
- Step 2: Research & Analysis (Business, Market, Competitor, Audience)
- Step 3: Scope of Work builder (drag-and-drop sections)
- Step 4: Technical Proposal (editor)
- Step 5: Financial Proposal (line items, totals, payment terms)
- Step 6: Mini Creative Brief (direction, tone, sample concepts)
- Step 7: Preview & Send
- Real-time sidebar showing completion %

#### Project Detail
- Top: Project name, status badge, client, Account Manager, timeline bar
- Tabs: Overview, Tasks (Kanban), Sprints, Deliverables, Campaigns, Reports
- Overview tab: Key metrics (tasks completed, deliverables approved, sprint status), recent activity, team members
- Tasks tab: Full Kanban board (To Do → In Progress → Review → Approved → Delivered)
- Sprint sub-tab: Current sprint with burndown chart

#### Sprint Board
- Columns: Planning → To Do → In Progress → Review → Approved → Delivered
- Cards show: Task title, assignee avatar, deadline indicator (green/yellow/red)
- Top: Sprint name, start/end dates, completion %, velocity
- Drag-and-drop, inline editing
- WIP limits per column

#### Strategy Workspace
- Left panel: Document navigator (Research Report / Strategic Blueprint / Creative Brief)
- Center: Rich document editor with sections
- Right panel: AI-assisted insights panel (data from research inputs)
- Template selector with auto-fill from project data
- Approval workflow: Submit → Strategy Lead Review → Head of Strategy Approve

#### Client Portal
- Welcome banner with project status
- Progress cards: Onboarding, Strategy, Production current status
- Deliverable gallery: Grid view of approved assets
- Reports section: Weekly/monthly PDFs with KPIs
- Approval queue: Pending approvals with "Approve" / "Request Changes" buttons
- Communication: Chat-like interface with SLA indicator
- Invoices: Payment history, pending invoices, download PDF
- "No surprises" design philosophy: everything the client needs to know is surfaced

#### Knowledge Base
- Left: Department filter + search bar + tag cloud
- Center: SOP cards showing code, name, department, version, status badge
- Click SOP → full 16-section view with expandable sections
- Each section is a collapsible card
- Video embedded at relevant sections
- Checklist mode: Shows only the checklist for quick execution
- Related templates linked inline

#### Automation Center
- Top: "All Automations" count, "Active" / "Failed" / "Disabled" tabs
- List view: Name, trigger type, last run, status toggle
- Click to edit: Visual trigger/condition/action builder
- Testing: "Run Test" button shows execution log
- Failed runs tab: Error details with retry option

---

## 12. Technical Architecture

### 12.1 Recommended Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS | SSR for SEO, React ecosystem, type safety |
| **State Management** | Zustand + React Query (TanStack Query) | Lightweight, server state caching |
| **UI Library** | shadcn/ui + Radix Primitives | Accessible, customizable, modern |
| **Backend** | NestJS (Node.js), TypeScript | Modular, decorators, DI, enterprise-ready |
| **API** | REST (primary) + WebSockets (realtime) | Standard REST + realtime for notifications |
| **Database** | PostgreSQL 16 | Relational integrity, JSONB for flexible fields |
| **ORM** | Prisma | Type-safe, migrations, excellent DX |
| **Cache** | Redis 7 | Session store, rate limiting, job queues |
| **Storage** | S3-compatible (MinIO / AWS S3 / DigitalOcean Spaces) | File uploads, asset storage |
| **Auth** | JWT (access + refresh tokens), RBAC | Stateless auth, role-based access |
| **Queue** | Bull (Redis-backed) | Background jobs, automation execution |
| **Realtime** | WebSocket (Socket.io or native) | Notifications, live updates |
| **Monitoring** | Prometheus + Grafana | Metrics, dashboards, alerting |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | Centralized logging |
| **CI/CD** | GitHub Actions + Docker | Automated testing, build, deploy |
| **Container** | Docker + Kubernetes (for scale) | Orchestration, scaling |
| **Testing** | Jest (unit), Playwright (e2e) | Frontend + backend testing |

### 12.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│              Next.js SPA + Server Components                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────────┐
│                   Nginx / Load Balancer                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Next.js (Server)                             │
│         API Routes + SSR + Middleware (Auth)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  NestJS (Backend API)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────────┐    │
│  │ Auth    │ │ CRM     │ │ Sales   │ │ Projects       │    │
│  │ Module  │ │ Module  │ │ Module  │ │ Module         │    │
│  ├─────────┤ ├─────────┤ ├─────────┤ ├────────────────┤    │
│  │ Strategy│ │ Finance │ │ KB      │ │ Automation     │    │
│  │ Module  │ │ Module  │ │ Module  │ │ Module         │    │
│  └────┬────┘ └────┬────┘ └────┬────┘ └───────┬────────┘    │
│       │           │           │               │             │
│  ┌────▼───────────▼───────────▼───────────────▼────────┐    │
│  │              Shared Core (Prisma, Guards, Pipes)     │    │
│  └───────────────────────┬─────────────────────────────┘    │
└──────────────────────────┼─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                    Infrastructure Layer                       │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │ PostgreSQL │  │   Redis    │  │   S3 Storage       │    │
│  │ (Primary)  │  │ (Cache/Q)  │  │ (Files/Assets)     │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  Bull/Queue │  │WebSocket   │  │   Elasticsearch    │    │
│  │ (Background)│  │(Realtime)  │  │   (Logging)        │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 12.3 Security Architecture

**Authentication:**
- JWT with access (24h) and refresh (30d) tokens
- HTTP-only refresh token cookie
- Login rate limiting (5 attempts/min per IP)
- Session invalidation on password change

**Authorization:**
- RBAC with role-permission mapping
- Resource-level guards (e.g., Sales Rep can only edit assigned leads)
- Middleware on every NestJS route
- Frontend route guards with redirect

**Data Security:**
- All passwords hashed with bcrypt (12 rounds)
- Database encryption at rest
- HTTPS enforced
- API rate limiting (100 req/min per user, 1000 req/min per IP)
- Input validation (class-validator decorators)
- SQL injection protection via Prisma parameterized queries
- CORS restricted to known origins

**File Storage:**
- Signed URLs for S3 access (expiring)
- File type validation (MIME check)
- Max file size: 50MB
- Virus scanning for uploaded files
- Access control per project/clients

**Audit Logging:**
- All CRUD operations logged
- Authentication events logged
- Admin actions logged
- Logs retained for 12 months

### 12.4 Deployment Architecture

**Development:**
```
Local: Docker Compose (Postgres + Redis + MinIO + NestJS + Next.js)
```

**Staging:**
```
Single server: Docker Compose with all services
or
Kubernetes: 1 node cluster (minikube)
```

**Production:**
```
Kubernetes Cluster:
├─ Ingress Controller (Nginx)
├─ Frontend (Next.js): 2+ replicas
├─ Backend (NestJS): 3+ replicas
├─ PostgreSQL: Managed service (RDS/Cloud SQL)
├─ Redis: Managed service (ElastiCache/Cloud Memorystore)
├─ S3: Managed object storage
├─ Queue Worker: 2+ replicas
├─ WebSocket Server: 2+ replicas
└─ Monitoring: Prometheus + Grafana
```

---

## 13. Development Roadmap

### 13.1 Phase 1 — MVP (Months 1-4)

**Goal:** Core operational system enabling basic agency operations.

**Priority:** Critical

**Backend:**
- [ ] Project setup (NestJS, Prisma, PostgreSQL, Docker)
- [ ] Auth module (JWT, login, register, refresh)
- [ ] RBAC (roles, permissions, guards)
- [ ] User management CRUD
- [ ] CRM: Leads CRUD + scoring + pipeline stages
- [ ] CRM: Activity log
- [ ] Meetings CRUD
- [ ] Clients CRUD
- [ ] Projects CRUD
- [ ] Tasks CRUD + Kanban status
- [ ] Sprints CRUD
- [ ] Deliverables CRUD
- [ ] Approvals CRUD
- [ ] Simple file upload (S3)

**Frontend:**
- [ ] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] Auth screens (login, register)
- [ ] Dashboard (executive summary)
- [ ] CRM: Lead pipeline (Kanban)
- [ ] CRM: Lead detail view
- [ ] CRM: Activity log
- [ ] Projects list + detail
- [ ] Tasks board (Kanban)
- [ ] Deliverable management
- [ ] User management UI

**Core Infrastructure:**
- [ ] Docker Compose setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database migrations
- [ ] Error tracking setup

**Deliverables at MVP Launch:**
- Foundational CRM with lead pipeline
- Basic project management with tasks
- User management with RBAC
- File upload capability

### 13.2 Phase 2 — Growth (Months 5-8)

**Goal:** Full client lifecycle + automation + reporting.

**Priority:** High

**Backend:**
- [ ] Proposals module (CRUD + sections + wizard)
- [ ] Contracts module (generation + signing)
- [ ] Invoices + Payments module
- [ ] Campaigns + Campaign metrics
- [ ] KPI engine (definition + values + calculations)
- [ ] Dashboards (dynamic widgets)
- [ ] Knowledge Base (SOPs, articles, templates)
- [ ] Automation engine (triggers, conditions, actions)
- [ ] WebSocket for real-time notifications
- [ ] Reporting engine (weekly/monthly)
- [ ] Client Portal API (scoped endpoints)

**Frontend:**
- [ ] Proposal creator (wizard UI)
- [ ] Contract management UI
- [ ] Invoices + payment tracking
- [ ] Campaign management + metrics charts
- [ ] KPI dashboards (per department)
- [ ] Dashboard builder (drag-and-drop widgets)
- [ ] Knowledge Base UI (SOP viewer, search)
- [ ] Automation Center UI (visual rules builder)
- [ ] Client Portal (full experience)
- [ ] Notification center (in-app + email)

**Integrations:**
- [ ] Email service (SendGrid/Resend)
- [ ] WhatsApp Business API
- [ ] Calendar integration (Google/Outlook)
- [ ] Basic analytics integration

**Deliverables at Growth Launch:**
- Full client lifecycle (lead → renewal)
- Automated follow-ups and notifications
- Department KPIs with dashboards
- Client self-service portal
- SOP management and knowledge base

### 13.3 Phase 3 — Scale (Months 9-12)

**Goal:** Advanced intelligence, optimization, and scaling.

**Priority:** Medium

**Backend:**
- [ ] Advanced analytics engine (trends, forecasts)
- [ ] Client churn prediction model
- [ ] Lead scoring ML enhancement
- [ ] Resource management (capacity planning)
- [ ] Time tracking (per task/project)
- [ ] Profitability analysis engine
- [ ] Advanced automation (multi-step, conditional branching)
- [ ] Strategy workspace (full template-based document generation)
- [ ] Audit log (full CRUD tracking)
- [ ] Webhook management (inbound/outbound)
- [ ] Advanced search (Elasticsearch for KB + all entities)

**Frontend:**
- [ ] Advanced analytics dashboards
- [ ] Resource planning view (team calendar)
- [ ] Time tracking UI
- [ ] Profitability reports
- [ ] Strategy document editor (rich text + templates)
- [ ] Advanced reporting (custom date ranges, comparisons)
- [ ] Search across all modules
- [ ] Performance review UI

**Integrations:**
- [ ] Meta Ads API
- [ ] Google Ads API
- [ ] Google Analytics 4
- [ ] Slack integration
- [ ] Accounting software (Zoho/Xero)
- [ ] Zapier/Make webhooks

**Deliverables at Scale Launch:**
- Predictive analytics
- Resource management
- Full financial intelligence
- Deep platform integrations
- Advanced search

### 13.4 Phase 4 — Enterprise (Months 13-16)

**Goal:** Multi-company, white-label, franchise support.

**Priority:** Lower

**Backend:**
- [ ] Multi-tenant architecture (company isolation)
- [ ] White-label support (custom branding per tenant)
- [ ] Franchise management (parent/child company relationships)
- [ ] Enterprise SSO (SAML/OAuth)
- [ ] Advanced permission inheritance
- [ ] Data export/import (full backup)
- [ ] API rate limiting per tenant
- [ ] Usage tracking and billing
- [ ] Custom fields and entity extensions

**Frontend:**
- [ ] Tenant switcher
- [ ] White-label configuration UI
- [ ] Franchise dashboard (cross-company analytics)
- [ ] Custom field builder
- [ ] API key management UI

**Infrastructure:**
- [ ] Kubernetes production-ready setup
- [ ] Auto-scaling configuration
- [ ] Multi-region deployment ready
- [ ] 99.9% uptime SLA readiness
- [ ] Disaster recovery plan
- [ ] Load testing suite

**Deliverables at Enterprise Launch:**
- Multi-tenant architecture
- White-label capability
- Franchise management
- Enterprise integrations
- 99.9% uptime infrastructure

---

## 14. Scaling Strategy

### 14.1 Database Scaling

- **Phase 1-2:** Single PostgreSQL instance with connection pooling (PgBouncer)
- **Phase 3:** Read replicas for reporting queries
- **Phase 4:** Sharding by tenant (multi-tenant), or vertical scaling (bigger instance)
- **Always:** Proper indexing (see index definitions), query optimization, `EXPLAIN ANALYZE` on slow queries

### 14.2 Application Scaling

- **Phase 1-2:** Vertical scaling (single server, Docker Compose)
- **Phase 3:** Horizontal scaling (Kubernetes, multiple replicas)
- **Phase 4:** Micro-frontends for client portal (separate deploy), API gateway for routing
- **Background jobs:** Bull queue with Redis, worker pods auto-scale based on queue depth

### 14.3 Team Scaling

- **Phase 1:** 1-2 developers (full-stack)
- **Phase 2:** 3-4 developers (frontend + backend split)
- **Phase 3:** 5-8 developers (teams: platform, features, integrations)
- **Phase 4:** Multiple squads aligned with Machines (Growth squad, Delivery squad, Platform squad)

### 14.4 Business Scaling (Franchise Prototype)

The entire system is designed for replication:
- SOPs are system-encoded, not document-based
- Decision trees replace founder judgment
- KPIs replace gut feeling
- Automation replaces manual work
- Role cards replace "ask the founder"
- Client journey is standardized end-to-end

This blueprint is the **complete specification** for building Mkhtalif's ERP/Agency Operating System. A software engineering team can begin implementation immediately using this document as the single source of truth.
