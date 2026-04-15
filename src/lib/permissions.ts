import { UserRole } from "@prisma/client";

type Permission =
  | "profiles:read"
  | "profiles:read:full"
  | "profiles:create"
  | "profiles:update:own"
  | "profiles:update:any"
  | "profiles:verify"
  | "profiles:delete"
  | "professions:manage"
  | "skills:manage"
  | "institutions:manage"
  | "users:manage"
  | "users:read"
  | "contact:send"
  | "contact:receive"
  | "favorites:manage"
  | "admin:access"
  | "admin:stats"
  | "admin:moderate"
  | "admin:audit"
  | "availability:manage:own"
  | "search:full"
  | "search:basic";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "profiles:read",
    "profiles:read:full",
    "profiles:create",
    "profiles:update:any",
    "profiles:verify",
    "profiles:delete",
    "professions:manage",
    "skills:manage",
    "institutions:manage",
    "users:manage",
    "users:read",
    "contact:send",
    "contact:receive",
    "favorites:manage",
    "admin:access",
    "admin:stats",
    "admin:moderate",
    "admin:audit",
    "search:full",
    "search:basic",
  ],
  MODERATOR: [
    "profiles:read",
    "profiles:read:full",
    "profiles:verify",
    "users:read",
    "admin:access",
    "admin:stats",
    "admin:moderate",
    "search:full",
    "search:basic",
  ],
  PROFESSIONAL: [
    "profiles:read",
    "profiles:create",
    "profiles:update:own",
    "contact:receive",
    "availability:manage:own",
    "search:basic",
  ],
  RECRUITER: [
    "profiles:read",
    "profiles:read:full",
    "contact:send",
    "favorites:manage",
    "search:full",
    "search:basic",
  ],
  INSTITUTION: [
    "profiles:read",
    "search:basic",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isAdminOrModerator(role: UserRole): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, "admin:access");
}
