import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import { RoleName } from '@tektariq/db';

type Subjects = 'Task' | 'Project' | 'ProjectMember' | 'User' | 'ChangeRequest' | 'CABDecision' | 'all';
type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve' | 'assign' | 'vote';

export type AppAbility = PureAbility<[Actions, Subjects]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export function defineAbilityFor(user: { id: string; roles: RoleName[]; projectRoles?: { projectId: string; role: RoleName }[] }) {
  const { can, cannot, build } = new AbilityBuilder(AppAbility);

  // ---- RBAC defaults ----

  if (user.roles.includes(RoleName.SUPER_ADMIN)) {
    can('manage', 'all');
  }

  if (user.roles.includes(RoleName.CEO)) {
    can('read', 'all');
    cannot('create', 'all');
    cannot('update', 'all');
    cannot('delete', 'all');
    cannot('approve', 'all');
  }

  // Product Department
  if (user.roles.includes(RoleName.CPO)) {
    can('create', 'Task', { module: 'PRODUCT' });
    can('update', 'Task', { module: 'PRODUCT' });
    can('approve', 'Task', { module: 'PRODUCT' });
    can('delete', 'Task', { module: 'PRODUCT' });
    can('create', 'Project');
    can('read', 'all');
  }

  if (user.roles.includes(RoleName.PRODUCT_MANAGER)) {
    can('create', 'Task', { module: 'PRODUCT' });
    can('update', 'Task', { module: 'PRODUCT' });
  }

  if (user.roles.includes(RoleName.PRODUCT_DESIGNER)) {
    can('create', 'Task', { module: 'PRODUCT' });
    can('update', 'Task', { module: 'PRODUCT', assigneeId: user.id });
  }

  if (user.roles.includes(RoleName.PRODUCT_DESIGN_TEAM_LEAD)) {
    can('update', 'Task', { module: 'PRODUCT' });
    can('approve', 'Task', { module: 'PRODUCT' });
  }

  // Engineering Department
  if (user.roles.includes(RoleName.CTO)) {
    can('update', 'Task', { module: 'ENGINEERING' });
    can('approve', 'Task', { module: 'ENGINEERING' });
  }

  [RoleName.ENG_TEAM_LEAD_FRONTEND, RoleName.ENG_TEAM_LEAD_BACKEND, RoleName.ENG_TEAM_LEAD_CLOUD_DEVOPS, RoleName.ENG_TEAM_LEAD_QA].forEach((leadRole) => {
    if (user.roles.includes(leadRole)) {
      can('update', 'Task', { module: 'ENGINEERING' });
      can('approve', 'Task', { module: 'ENGINEERING' });
      can('assign', 'Task', { module: 'ENGINEERING' });
    }
  });

  if (user.roles.includes(RoleName.QA_ENGINEER)) {
    can('create', 'Task', { module: 'ENGINEERING' });
  }

  if (user.roles.includes(RoleName.FRONTEND_DEVELOPER) || user.roles.includes(RoleName.BACKEND_DEVELOPER) || user.roles.includes(RoleName.CLOUD_DEVOPS_ENGINEER)) {
    can('update', 'Task', { module: 'ENGINEERING', assigneeId: user.id });
  }

  // Brand Department
  if (user.roles.includes(RoleName.CBO)) {
    can('update', 'Task', { module: 'BRAND' });
    can('approve', 'Task', { module: 'BRAND' });
    can('delete', 'Task', { module: 'BRAND' });
  }

  if (user.roles.includes(RoleName.BRAND_TEAM_LEAD)) {
    can('update', 'Task', { module: 'BRAND' });
    can('approve', 'Task', { module: 'BRAND' });
  }

  if (user.roles.includes(RoleName.BRAND_DESIGNER) || user.roles.includes(RoleName.GRAPHICS_DESIGNER) || user.roles.includes(RoleName.MOTION_DESIGNER)) {
    can('update', 'Task', { module: 'BRAND', assigneeId: user.id });
  }

  // Business Analysis Department
  if (user.roles.includes(RoleName.COO)) {
    can('update', 'Task', { module: 'BUSINESS_ANALYSIS' });
    can('approve', 'Task', { module: 'BUSINESS_ANALYSIS' });
  }

  if (user.roles.includes(RoleName.BA_TEAM_LEAD)) {
    can('update', 'Task', { module: 'BUSINESS_ANALYSIS' });
    can('approve', 'Task', { module: 'BUSINESS_ANALYSIS' });
  }

  if (user.roles.includes(RoleName.DATA_ANALYST) || user.roles.includes(RoleName.BUSINESS_ANALYST)) {
    can('update', 'Task', { module: 'BUSINESS_ANALYSIS', assigneeId: user.id });
  }

  if (user.roles.includes(RoleName.CAB_MEMBER)) {
    can('read', 'all');
    can('vote', 'CABDecision');
  }

  // ---- ABAC: PRODUCT_OWNER gets manage on their own projects ----
  const ownedProjectIds = (user.projectRoles || [])
    .filter((pr) => pr.role === RoleName.PRODUCT_OWNER)
    .map((pr) => pr.projectId);

  if (ownedProjectIds.length > 0) {
    can('manage', 'Task', { projectId: { $in: ownedProjectIds } });
    can('manage', 'ProjectMember', { projectId: { $in: ownedProjectIds } });
    can('manage', 'Project', { id: { $in: ownedProjectIds } });
    can('manage', 'ChangeRequest', { projectId: { $in: ownedProjectIds } });
  }

  // ---- Hard rules ----

  // Self-approval is structurally forbidden regardless of role stacking
  cannot('approve', 'Task', { assigneeId: user.id }).because('Self-approval is not allowed');

  return build();
}
