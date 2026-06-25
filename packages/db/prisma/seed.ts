import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_ROLES: RoleName[] = [
  RoleName.CEO,
  RoleName.SUPER_ADMIN,
  RoleName.CPO,
  RoleName.PRODUCT_MANAGER,
  RoleName.PRODUCT_DESIGNER,
  RoleName.PRODUCT_DESIGN_TEAM_LEAD,
  RoleName.CTO,
  RoleName.ENG_TEAM_LEAD_FRONTEND,
  RoleName.ENG_TEAM_LEAD_BACKEND,
  RoleName.ENG_TEAM_LEAD_CLOUD_DEVOPS,
  RoleName.ENG_TEAM_LEAD_QA,
  RoleName.FRONTEND_DEVELOPER,
  RoleName.BACKEND_DEVELOPER,
  RoleName.CLOUD_DEVOPS_ENGINEER,
  RoleName.QA_ENGINEER,
  RoleName.CBO,
  RoleName.BRAND_TEAM_LEAD,
  RoleName.BRAND_DESIGNER,
  RoleName.GRAPHICS_DESIGNER,
  RoleName.MOTION_DESIGNER,
  RoleName.COO,
  RoleName.BA_TEAM_LEAD,
  RoleName.DATA_ANALYST,
  RoleName.BUSINESS_ANALYST,
  RoleName.CAB_MEMBER,
  RoleName.PRODUCT_OWNER,
];

async function main() {
  console.log('Seeding database...');

  for (const role of ALL_ROLES) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
  console.log('Roles created');

  const depts = [
    { name: 'Product', chiefRole: RoleName.CPO },
    { name: 'Engineering', chiefRole: RoleName.CTO },
    { name: 'Brand', chiefRole: RoleName.CBO },
    { name: 'Business Analysis', chiefRole: RoleName.COO },
  ];
  for (const d of depts) {
    await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: { name: d.name, chiefRoleId: (await prisma.role.findUnique({ where: { name: d.chiefRole } }))!.id },
    });
  }
  console.log('Departments created');

  const reportingLines: [RoleName, RoleName][] = [
    [RoleName.PRODUCT_DESIGNER, RoleName.PRODUCT_DESIGN_TEAM_LEAD],
    [RoleName.PRODUCT_DESIGN_TEAM_LEAD, RoleName.CPO],
    [RoleName.PRODUCT_MANAGER, RoleName.CPO],
    [RoleName.FRONTEND_DEVELOPER, RoleName.ENG_TEAM_LEAD_FRONTEND],
    [RoleName.BACKEND_DEVELOPER, RoleName.ENG_TEAM_LEAD_BACKEND],
    [RoleName.CLOUD_DEVOPS_ENGINEER, RoleName.ENG_TEAM_LEAD_CLOUD_DEVOPS],
    [RoleName.QA_ENGINEER, RoleName.ENG_TEAM_LEAD_QA],
    [RoleName.ENG_TEAM_LEAD_FRONTEND, RoleName.CTO],
    [RoleName.ENG_TEAM_LEAD_BACKEND, RoleName.CTO],
    [RoleName.ENG_TEAM_LEAD_CLOUD_DEVOPS, RoleName.CTO],
    [RoleName.ENG_TEAM_LEAD_QA, RoleName.CTO],
    [RoleName.BRAND_DESIGNER, RoleName.BRAND_TEAM_LEAD],
    [RoleName.GRAPHICS_DESIGNER, RoleName.BRAND_TEAM_LEAD],
    [RoleName.MOTION_DESIGNER, RoleName.BRAND_TEAM_LEAD],
    [RoleName.BRAND_TEAM_LEAD, RoleName.CBO],
    [RoleName.DATA_ANALYST, RoleName.BA_TEAM_LEAD],
    [RoleName.BUSINESS_ANALYST, RoleName.BA_TEAM_LEAD],
    [RoleName.BA_TEAM_LEAD, RoleName.COO],
  ];
  for (const [role, reportsTo] of reportingLines) {
    const roleId = (await prisma.role.findUnique({ where: { name: role } }))!.id;
    const reportsToId = (await prisma.role.findUnique({ where: { name: reportsTo } }))!.id;
    await prisma.reportingLine.upsert({
      where: { roleId_reportsToRoleId: { roleId, reportsToRoleId: reportsToId } },
      update: {},
      create: { roleId, reportsToRoleId: reportsToId },
    });
  }
  console.log('Reporting lines created');

  const passwordHash = await bcrypt.hash('TeKtArIq2024!', 12);

  const seedUsers = [
    { email: 'superadmin@tektariq.com', name: 'Super Admin', roles: [RoleName.SUPER_ADMIN, RoleName.CAB_MEMBER] },
    { email: 'ceo@tektariq.com', name: 'Alice CEO', roles: [RoleName.CEO, RoleName.CAB_MEMBER] },
    { email: 'cpo@tektariq.com', name: 'Bob CPO', roles: [RoleName.CPO, RoleName.CAB_MEMBER] },
    { email: 'cto@tektariq.com', name: 'Carol CTO', roles: [RoleName.CTO, RoleName.CAB_MEMBER] },
    { email: 'cbo@tektariq.com', name: 'Dave CBO', roles: [RoleName.CBO, RoleName.CAB_MEMBER] },
    { email: 'coo@tektariq.com', name: 'Eve COO', roles: [RoleName.COO, RoleName.CAB_MEMBER] },
    { email: 'pm@tektariq.com', name: 'Frank PM', roles: [RoleName.PRODUCT_MANAGER] },
    { email: 'designer@tektariq.com', name: 'Grace Designer', roles: [RoleName.PRODUCT_DESIGNER] },
    { email: 'design-lead@tektariq.com', name: 'Hank Design Lead', roles: [RoleName.PRODUCT_DESIGN_TEAM_LEAD] },
    { email: 'frontend-lead@tektariq.com', name: 'Ivy Frontend Lead', roles: [RoleName.ENG_TEAM_LEAD_FRONTEND] },
    { email: 'backend-lead@tektariq.com', name: 'Jack Backend Lead', roles: [RoleName.ENG_TEAM_LEAD_BACKEND] },
    { email: 'devops-lead@tektariq.com', name: 'Kate DevOps Lead', roles: [RoleName.ENG_TEAM_LEAD_CLOUD_DEVOPS] },
    { email: 'qa-lead@tektariq.com', name: 'Leo QA Lead', roles: [RoleName.ENG_TEAM_LEAD_QA] },
    { email: 'frontend@tektariq.com', name: 'Maria Frontend', roles: [RoleName.FRONTEND_DEVELOPER] },
    { email: 'backend@tektariq.com', name: 'Nathan Backend', roles: [RoleName.BACKEND_DEVELOPER] },
    { email: 'devops@tektariq.com', name: 'Olivia DevOps', roles: [RoleName.CLOUD_DEVOPS_ENGINEER] },
    { email: 'qa@tektariq.com', name: 'Paul QA', roles: [RoleName.QA_ENGINEER] },
    { email: 'brand-lead@tektariq.com', name: 'Quinn Brand Lead', roles: [RoleName.BRAND_TEAM_LEAD] },
    { email: 'brand-designer@tektariq.com', name: 'Rachel Brand', roles: [RoleName.BRAND_DESIGNER] },
    { email: 'graphics@tektariq.com', name: 'Sam Graphics', roles: [RoleName.GRAPHICS_DESIGNER] },
    { email: 'motion@tektariq.com', name: 'Tina Motion', roles: [RoleName.MOTION_DESIGNER] },
    { email: 'ba-lead@tektariq.com', name: 'Uma BA Lead', roles: [RoleName.BA_TEAM_LEAD] },
    { email: 'data-analyst@tektariq.com', name: 'Victor Data', roles: [RoleName.DATA_ANALYST] },
    { email: 'ba@tektariq.com', name: 'Wendy BA', roles: [RoleName.BUSINESS_ANALYST] },
  ];

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, passwordHash },
    });
    for (const r of u.roles) {
      const role = await prisma.role.findUnique({ where: { name: r } });
      if (role) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          update: {},
          create: { userId: user.id, roleId: role.id },
        });
      }
    }
  }
  console.log('Users created');

  const poUser = await prisma.user.findUnique({ where: { email: 'superadmin@tektariq.com' } });
  const pmUser = await prisma.user.findUnique({ where: { email: 'pm@tektariq.com' } });
  const designerUser = await prisma.user.findUnique({ where: { email: 'designer@tektariq.com' } });
  const feUser = await prisma.user.findUnique({ where: { email: 'frontend@tektariq.com' } });

  if (poUser && pmUser) {
    const project = await prisma.project.upsert({
      where: { id: 'seed-project-1' },
      update: {},
      create: {
        id: 'seed-project-1',
        name: 'Client Portal Redesign',
        status: 'ACTIVE' as any,
        productOwnerId: poUser.id,
        targetStartDate: new Date('2026-01-01'),
        targetEndDate: new Date('2026-06-30'),
        description: 'Redesign and rebuild the client-facing portal with modern UX',
      },
    });

    const poRole = await prisma.role.findUnique({ where: { name: RoleName.PRODUCT_OWNER } });
    if (poRole) {
      await prisma.projectMember.upsert({
        where: { projectId_userId_role: { projectId: project.id, userId: poUser.id, role: RoleName.PRODUCT_OWNER } },
        update: {},
        create: { projectId: project.id, userId: poUser.id, role: RoleName.PRODUCT_OWNER },
      });
    }

    await prisma.projectMember.upsert({
      where: { projectId_userId_role: { projectId: project.id, userId: pmUser.id, role: RoleName.PRODUCT_MANAGER } },
      update: {},
      create: { projectId: project.id, userId: pmUser.id, role: RoleName.PRODUCT_MANAGER },
    });

    if (designerUser) {
      const designLeadRole = await prisma.role.findUnique({ where: { name: RoleName.PRODUCT_DESIGN_TEAM_LEAD } });
      if (designLeadRole) {
        const dlUser = await prisma.user.findUnique({ where: { email: 'design-lead@tektariq.com' } });
        if (dlUser) {
          await prisma.projectMember.upsert({
            where: { projectId_userId_role: { projectId: project.id, userId: dlUser.id, role: RoleName.PRODUCT_DESIGN_TEAM_LEAD } },
            update: {},
            create: { projectId: project.id, userId: dlUser.id, role: RoleName.PRODUCT_DESIGN_TEAM_LEAD },
          });
        }
      }
      await prisma.projectMember.upsert({
        where: { projectId_userId_role: { projectId: project.id, userId: designerUser.id, role: RoleName.PRODUCT_DESIGNER } },
        update: {},
        create: { projectId: project.id, userId: designerUser.id, role: RoleName.PRODUCT_DESIGNER },
      });
    }

    if (feUser) {
      await prisma.projectMember.upsert({
        where: { projectId_userId_role: { projectId: project.id, userId: feUser.id, role: RoleName.FRONTEND_DEVELOPER } },
        update: {},
        create: { projectId: project.id, userId: feUser.id, role: RoleName.FRONTEND_DEVELOPER },
      });
    }

    const tasks = [
      { title: 'Design new landing page', module: 'PRODUCT' as any, status: 'SUBMITTED_FOR_REVIEW' as any, assigneeId: designerUser?.id },
      { title: 'Implement user authentication', module: 'ENGINEERING' as any, discipline: 'FRONTEND' as any, status: 'IN_PROGRESS' as any, assigneeId: feUser?.id },
      { title: 'Set up CI/CD pipeline', module: 'ENGINEERING' as any, discipline: 'CLOUD_DEVOPS' as any, status: 'BACKLOG' as any },
      { title: 'Create brand style guide', module: 'BRAND' as any, status: 'DRAFT' as any },
      { title: 'User research analysis', module: 'BUSINESS_ANALYSIS' as any, status: 'ASSIGNED' as any, assigneeId: (await prisma.user.findUnique({ where: { email: 'ba@tektariq.com' } }))?.id },
    ];

    for (const t of tasks) {
      await prisma.task.create({
        data: {
          projectId: project.id,
          title: t.title,
          module: t.module,
          discipline: t.discipline,
          status: t.status,
          assigneeId: t.assigneeId,
        },
      });
    }
    console.log('Seed project and tasks created');
  }

  await prisma.projectTemplate.upsert({
    where: { id: 'template-1' },
    update: {},
    create: {
      id: 'template-1',
      name: 'Standard Project',
      defaultMilestones: JSON.stringify([
        { title: 'Discovery Complete', weeksFromStart: 2 },
        { title: 'Design Complete', weeksFromStart: 6 },
        { title: 'Development Complete', weeksFromStart: 14 },
        { title: 'QA Complete', weeksFromStart: 18 },
        { title: 'Launch', weeksFromStart: 20 },
      ]),
      defaultRoles: JSON.stringify([
        RoleName.PRODUCT_MANAGER,
        RoleName.PRODUCT_DESIGNER,
        RoleName.FRONTEND_DEVELOPER,
        RoleName.BACKEND_DEVELOPER,
        RoleName.QA_ENGINEER,
        RoleName.BRAND_DESIGNER,
        RoleName.BUSINESS_ANALYST,
      ]),
    },
  });

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
