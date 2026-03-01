export const APP_ROLES = [
  "admin",
  "core_operator",
  "event_operator",
  "car_operator",
  "viewer",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AppPermission =
  | "dashboard.view"
  | "lead.view"
  | "lead.create"
  | "lead.status.update"
  | "core.opportunity.view"
  | "core.opportunity.create"
  | "module.core.view"
  | "module.event.view"
  | "module.event.update"
  | "module.event.report_opportunity"
  | "module.car.view"
  | "module.car.update"
  | "module.car.decide_opportunity"
  | "module.cleaning.view";

const ROLE_PERMISSIONS: Record<AppRole, readonly AppPermission[]> = {
  admin: [
    "dashboard.view",
    "lead.view",
    "lead.create",
    "lead.status.update",
    "core.opportunity.view",
    "core.opportunity.create",
    "module.core.view",
    "module.event.view",
    "module.event.update",
    "module.event.report_opportunity",
    "module.car.view",
    "module.car.update",
    "module.car.decide_opportunity",
    "module.cleaning.view",
  ],
  core_operator: [
    "dashboard.view",
    "lead.view",
    "lead.create",
    "lead.status.update",
    "core.opportunity.view",
    "core.opportunity.create",
    "module.core.view",
    "module.event.view",
    "module.car.view",
    "module.cleaning.view",
  ],
  event_operator: [
    "dashboard.view",
    "lead.view",
    "module.event.view",
    "module.event.update",
    "module.event.report_opportunity",
    "module.cleaning.view",
  ],
  car_operator: [
    "dashboard.view",
    "lead.view",
    "module.car.view",
    "module.car.update",
    "module.car.decide_opportunity",
    "module.cleaning.view",
  ],
  viewer: [
    "dashboard.view",
    "lead.view",
    "core.opportunity.view",
    "module.core.view",
    "module.event.view",
    "module.car.view",
    "module.cleaning.view",
  ],
};

export function isAppRole(value: unknown): value is AppRole {
  if (typeof value !== "string") {
    return false;
  }
  return APP_ROLES.includes(value as AppRole);
}

export function getRolePermissions(role: AppRole): readonly AppPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: AppRole, permission: AppPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getRoleLabel(role: AppRole): string {
  if (role === "admin") return "Administrator";
  if (role === "core_operator") return "Operator Core";
  if (role === "event_operator") return "Operator Event";
  if (role === "car_operator") return "Operator Transport";
  return "Podglad";
}
