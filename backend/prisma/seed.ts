import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();

  const departments = [
    { name: 'Growth', code: 'growth' },
    { name: 'Pre-Sales', code: 'pre_sales' },
    { name: 'Sales', code: 'sales' },
    { name: 'Client Success', code: 'cs' },
    { name: 'Strategy', code: 'strategy' },
    { name: 'Production', code: 'production' },
    { name: 'Operations', code: 'ops' },
  ];

  const roles = [
    { name: 'Super Admin', code: 'su', level: 100 },
    { name: 'CEO', code: 'ceo', level: 90 },
    { name: 'Head of Sales', code: 'hos', level: 80 },
    { name: 'Lead Manager', code: 'lm', level: 60 },
    { name: 'Sales Team Lead', code: 'stl', level: 70 },
    { name: 'Sales Rep', code: 'sr', level: 60 },
    { name: 'Head of Department', code: 'hod', level: 80 },
    { name: 'Strategy Team Lead', code: 'strl', level: 70 },
    { name: 'Strategist', code: 'strat', level: 60 },
    { name: 'Art Director', code: 'ad', level: 70 },
    { name: 'Account Manager', code: 'am', level: 60 },
    { name: 'Project Manager', code: 'pm', level: 60 },
    { name: 'Designer', code: 'des', level: 50 },
    { name: 'Video Editor', code: 'vid', level: 50 },
    { name: 'Copywriter', code: 'cw', level: 50 },
    { name: 'Media Buyer', code: 'mb', level: 50 },
    { name: 'Ops Manager', code: 'om', level: 70 },
    { name: 'Finance', code: 'fin', level: 60 },
    { name: 'Admin', code: 'admin', level: 50 },
  ];

  const pipelineStages = [
    { name: 'New Lead', code: 'new_lead', stageOrder: 1, probabilityDefault: 10 },
    { name: 'Qualification', code: 'qualification', stageOrder: 2, probabilityDefault: 20 },
    { name: 'Qualified', code: 'qualified', stageOrder: 3, probabilityDefault: 30 },
    { name: 'Meeting Scheduled', code: 'meeting_scheduled', stageOrder: 4, probabilityDefault: 40 },
    { name: 'Proposal Sent', code: 'proposal_sent', stageOrder: 5, probabilityDefault: 60 },
    { name: 'Negotiation', code: 'negotiation', stageOrder: 6, probabilityDefault: 75 },
    { name: 'Won', code: 'won', stageOrder: 7, probabilityDefault: 100 },
    { name: 'Lost', code: 'lost', stageOrder: 8, probabilityDefault: 0 },
    { name: 'Archive', code: 'archive', stageOrder: 9, probabilityDefault: 0 },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  for (const stage of pipelineStages) {
    await prisma.pipelineStage.upsert({
      where: { code: stage.code },
      update: {},
      create: stage,
    });
  }

  const allRoles = await prisma.role.findMany();

  const resources: { resource: string; actions: string[] }[] = [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'analytics', actions: ['view'] },
    { resource: 'reports', actions: ['view'] },
    { resource: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'clients', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'proposals', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'contracts', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'invoices', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'payments', actions: ['view', 'create'] },
    { resource: 'projects', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'deliverables', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'campaigns', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'time', actions: ['view', 'create', 'edit'] },
    { resource: 'strategy', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'kpis', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'knowledge', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'automation', actions: ['view', 'manage'] },
    { resource: 'audit', actions: ['view'] },
    { resource: 'users', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'portal', actions: ['view'] },
  ];

  const createdPermissions: Record<string, string> = {};
  for (const { resource, actions } of resources) {
    for (const action of actions) {
      const perm = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: { description: `${action} ${resource}` },
        create: { resource, action, description: `${action} ${resource}` },
      });
      createdPermissions[`${resource}:${action}`] = perm.id;
    }
  }

  const permOf = (resource: string, actions: string[]) =>
    actions.map((a) => createdPermissions[`${resource}:${a}`]).filter(Boolean);

  const rolePerms: Record<string, string[]> = {
    su: Object.values(createdPermissions),
    ceo: Object.values(createdPermissions),
    hos: [
      ...permOf('dashboard', ['view']),
      ...permOf('analytics', ['view']),
      ...permOf('reports', ['view']),
      ...permOf('leads', ['view', 'create', 'edit', 'delete']),
      ...permOf('clients', ['view', 'create', 'edit', 'delete']),
      ...permOf('proposals', ['view', 'create', 'edit', 'delete']),
      ...permOf('contracts', ['view', 'create', 'edit', 'delete']),
      ...permOf('invoices', ['view', 'create', 'edit', 'delete']),
      ...permOf('payments', ['view', 'create']),
      ...permOf('campaigns', ['view', 'create', 'edit', 'delete']),
      ...permOf('knowledge', ['view']),
    ],
    stl: [
      ...permOf('dashboard', ['view']),
      ...permOf('analytics', ['view']),
      ...permOf('leads', ['view', 'create', 'edit', 'delete']),
      ...permOf('clients', ['view', 'create', 'edit']),
      ...permOf('proposals', ['view', 'create', 'edit']),
      ...permOf('contracts', ['view', 'create']),
      ...permOf('invoices', ['view']),
      ...permOf('campaigns', ['view', 'create']),
    ],
    lm: [
      ...permOf('dashboard', ['view']),
      ...permOf('leads', ['view', 'create', 'edit']),
      ...permOf('clients', ['view']),
      ...permOf('proposals', ['view', 'create']),
      ...permOf('campaigns', ['view']),
      ...permOf('tasks', ['view']),
      ...permOf('knowledge', ['view']),
    ],
    sr: [
      ...permOf('dashboard', ['view']),
      ...permOf('leads', ['view', 'create', 'edit']),
      ...permOf('clients', ['view']),
      ...permOf('proposals', ['view', 'create']),
      ...permOf('campaigns', ['view']),
      ...permOf('tasks', ['view']),
    ],
    hod: [
      ...permOf('dashboard', ['view']),
      ...permOf('analytics', ['view']),
      ...permOf('reports', ['view']),
      ...permOf('projects', ['view', 'create', 'edit', 'delete']),
      ...permOf('tasks', ['view', 'create', 'edit', 'delete']),
      ...permOf('deliverables', ['view', 'create', 'edit', 'delete']),
      ...permOf('time', ['view', 'create', 'edit']),
      ...permOf('strategy', ['view']),
      ...permOf('kpis', ['view']),
      ...permOf('knowledge', ['view']),
    ],
    strl: [
      ...permOf('dashboard', ['view']),
      ...permOf('strategy', ['view', 'create', 'edit', 'delete']),
      ...permOf('kpis', ['view', 'create', 'edit']),
      ...permOf('knowledge', ['view', 'create', 'edit', 'delete']),
      ...permOf('projects', ['view']),
    ],
    strat: [
      ...permOf('strategy', ['view', 'create', 'edit']),
      ...permOf('kpis', ['view']),
      ...permOf('knowledge', ['view', 'create']),
    ],
    ad: [
      ...permOf('projects', ['view']),
      ...permOf('tasks', ['view', 'create', 'edit']),
      ...permOf('deliverables', ['view', 'create', 'edit']),
      ...permOf('time', ['view', 'create']),
    ],
    am: [
      ...permOf('dashboard', ['view']),
      ...permOf('clients', ['view', 'create', 'edit']),
      ...permOf('projects', ['view']),
      ...permOf('invoices', ['view']),
      ...permOf('proposals', ['view']),
      ...permOf('contracts', ['view']),
    ],
    pm: [
      ...permOf('projects', ['view', 'create', 'edit']),
      ...permOf('tasks', ['view', 'create', 'edit', 'delete']),
      ...permOf('deliverables', ['view', 'create', 'edit', 'delete']),
      ...permOf('time', ['view', 'create', 'edit']),
      ...permOf('dashboard', ['view']),
    ],
    des: [
      ...permOf('tasks', ['view', 'edit']),
      ...permOf('deliverables', ['view', 'create', 'edit']),
      ...permOf('time', ['view', 'create']),
    ],
    vid: [
      ...permOf('tasks', ['view', 'edit']),
      ...permOf('deliverables', ['view', 'create', 'edit']),
      ...permOf('time', ['view', 'create']),
    ],
    cw: [
      ...permOf('tasks', ['view', 'edit']),
      ...permOf('deliverables', ['view', 'create', 'edit']),
      ...permOf('time', ['view', 'create']),
    ],
    mb: [
      ...permOf('dashboard', ['view']),
      ...permOf('campaigns', ['view', 'create', 'edit', 'delete']),
      ...permOf('tasks', ['view']),
      ...permOf('knowledge', ['view']),
    ],
    om: [
      ...permOf('dashboard', ['view']),
      ...permOf('analytics', ['view']),
      ...permOf('projects', ['view', 'create', 'edit']),
      ...permOf('tasks', ['view', 'create', 'edit', 'delete']),
      ...permOf('deliverables', ['view', 'create', 'edit']),
      ...permOf('time', ['view', 'create', 'edit']),
      ...permOf('automation', ['view', 'manage']),
      ...permOf('knowledge', ['view']),
    ],
    fin: [
      ...permOf('dashboard', ['view']),
      ...permOf('analytics', ['view']),
      ...permOf('reports', ['view']),
      ...permOf('invoices', ['view', 'create', 'edit', 'delete']),
      ...permOf('payments', ['view', 'create']),
      ...permOf('clients', ['view']),
    ],
    admin: [
      ...permOf('dashboard', ['view']),
      ...permOf('users', ['view', 'create', 'edit', 'delete']),
      ...permOf('automation', ['view', 'manage']),
      ...permOf('audit', ['view']),
      ...permOf('portal', ['view']),
    ],
  };

  for (const role of allRoles) {
    const permIds = rolePerms[role.code];
    if (permIds) {
      for (const permissionId of permIds) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId } },
          update: {},
          create: { roleId: role.id, permissionId },
        });
      }
    }
  }

  const adminRole = await prisma.role.findUnique({ where: { code: 'su' } });
  const opsDept = await prisma.department.findUnique({ where: { code: 'ops' } });

  const passwordHash = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@mkhtalif.com' },
    update: {},
    create: {
      email: 'admin@mkhtalif.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole?.id,
      departmentId: opsDept?.id,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@mkhtalif.com' } });
  const stages = await prisma.pipelineStage.findMany({ orderBy: { stageOrder: 'asc' } });
  const [newLead, qual, qualified, meeting, proposal, negotiation, won] = stages;

  const leadsData = [
    {
      clientName: 'Ahmed Al-Rashid',
      company: 'Al-Rashid Holdings',
      email: 'ahmed@alrashid.com',
      phone: '+966 50 123 4567',
      source: 'referral',
      serviceType: 'branding',
      clarityLevel: 'high',
      budgetLevel: 'high',
      opportunitySize: 'enterprise',
      leadScore: 85,
      leadTemperature: 'hot' as const,
      stageId: negotiation!.id,
      dealValue: 250000,
      probability: 75,
      status: 'open' as const,
    },
    {
      clientName: 'Nora Al-Saud',
      company: 'Saudia Tech',
      email: 'nora@saudiatech.com',
      phone: '+966 55 987 6543',
      source: 'website',
      serviceType: 'web_development',
      clarityLevel: 'medium',
      budgetLevel: 'medium',
      opportunitySize: 'mid',
      leadScore: 60,
      leadTemperature: 'warm' as const,
      stageId: meeting!.id,
      dealValue: 85000,
      probability: 40,
      status: 'open' as const,
    },
    {
      clientName: 'Omar Al-Ghamdi',
      company: 'Ghamdi Group',
      email: 'omar@ghamdigroup.com',
      phone: '+966 54 321 7654',
      source: 'linkedin',
      serviceType: 'content',
      clarityLevel: 'medium',
      budgetLevel: 'low',
      opportunitySize: 'small',
      leadScore: 35,
      leadTemperature: 'cold' as const,
      stageId: qualified!.id,
      dealValue: 30000,
      probability: 20,
      status: 'open' as const,
    },
    {
      clientName: 'Layla Al-Harbi',
      company: 'Harbi Ventures',
      email: 'layla@harbiventures.com',
      phone: '+966 56 789 0123',
      source: 'referral',
      serviceType: 'social_media',
      clarityLevel: 'high',
      budgetLevel: 'medium',
      opportunitySize: 'mid',
      leadScore: 70,
      leadTemperature: 'warm' as const,
      stageId: proposal!.id,
      dealValue: 120000,
      probability: 60,
      status: 'open' as const,
    },
  ];

  const createdLeads: any[] = [];
  for (const lead of leadsData) {
    const { clientName, stageId, ...rest } = lead;
    const created = await prisma.lead.create({
      data: {
        clientName,
        stageId,
        assignedTo: adminUser!.id,
        nextAction: 'Follow up call',
        nextActionDate: new Date(Date.now() + 7 * 86400000),
        ...rest,
      },
    });
    createdLeads.push(created);
  }

  if (createdLeads.length > 0) {
    const targetLead = createdLeads[0];
    await prisma.client.create({
      data: {
        leadId: targetLead.id,
        name: targetLead.clientName,
        company: targetLead.company,
        email: targetLead.email,
        phone: targetLead.phone,
        industry: 'Technology',
        accountManagerId: adminUser!.id,
        status: 'active',
        lifetimeValue: targetLead.dealValue,
        acquiredAt: new Date(),
      },
    });
  }

  const growthDept = await prisma.department.findUnique({ where: { code: 'growth' } });
  const client = await prisma.client.findFirst();
  const p1id = '00000000-0000-0000-0000-000000000001';
  const p2id = '00000000-0000-0000-0000-000000000002';
  const p3id = '00000000-0000-0000-0000-000000000003';
  if (client) {
    await prisma.project.upsert({
      where: { id: p1id },
      update: {},
      create: {
        id: p1id,
        clientId: client.id,
        name: 'Q2 Brand Identity & Web Redesign',
        description: 'Complete brand identity refresh including logo, typography, color palette, and fully responsive website redesign.',
        status: 'strategy',
        priority: 'high',
        startDate: new Date(),
        targetEndDate: new Date(Date.now() + 90 * 86400000),
        accountManagerId: adminUser!.id,
        strategicLeadId: adminUser!.id,
        productionManagerId: adminUser!.id,
        budget: 250000,
        hourlyRate: 350,
        estimatedHours: 714,
      },
    });

    await prisma.project.upsert({
      where: { id: p2id },
      update: {},
      create: {
        id: p2id,
        clientId: client.id,
        name: 'Social Media Content Calendar - Monthly Retainer',
        description: 'Monthly social media content creation including 30 posts, 10 reels, and community management.',
        status: 'active',
        priority: 'medium',
        accountManagerId: adminUser!.id,
        budget: 15000,
      },
    });

    await prisma.project.upsert({
      where: { id: p3id },
      update: {},
      create: {
        id: p3id,
        clientId: client.id,
        name: 'Product Video Series',
        description: 'Production of 5 product demonstration videos for e-commerce launch campaign.',
        status: 'production',
        priority: 'medium',
        startDate: new Date(),
        targetEndDate: new Date(Date.now() + 45 * 86400000),
        accountManagerId: adminUser!.id,
        budget: 75000,
        estimatedHours: 200,
      },
    });
  }

  const tasksData = [
    { projectId: p1id, title: 'Brand audit & competitor analysis', assignedTo: adminUser!.id, status: 'delivered' as const, priority: 'high' as const, estimatedHours: 16 },
    { projectId: p1id, title: 'Logo concept development (3 directions)', assignedTo: adminUser!.id, status: 'in_progress' as const, priority: 'high' as const, estimatedHours: 24 },
    { projectId: p1id, title: 'Color palette & typography selection', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'medium' as const, estimatedHours: 8 },
    { projectId: p1id, title: 'Website wireframes (homepage + 4 inner pages)', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'high' as const, estimatedHours: 32 },
    { projectId: p1id, title: 'UI design & prototyping', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'high' as const, estimatedHours: 40 },
    { projectId: p1id, title: 'Frontend development', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'high' as const, estimatedHours: 80 },
    { projectId: p2id, title: 'Create 30 social media posts', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'medium' as const, estimatedHours: 20 },
    { projectId: p2id, title: 'Film & edit 10 reels', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'medium' as const, estimatedHours: 30 },
    { projectId: p3id, title: 'Script & storyboard', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'high' as const, estimatedHours: 12 },
    { projectId: p3id, title: 'Filming (Day 1)', assignedTo: adminUser!.id, status: 'todo' as const, priority: 'high' as const, estimatedHours: 16 },
  ];

  for (const task of tasksData) {
    await prisma.task.create({ data: task });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
