import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getRoleLabel,
  getRolePermissions,
  hasPermission,
  isAppRole,
  type AppPermission,
  type AppRole,
} from "./rbac";

type UnknownRecord = Record<string, unknown>;

export type AuthContext = {
  userId: string;
  displayName: string;
  role: AppRole;
  roleLabel: string;
};

function asObject(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }
  return nextPath;
}

function readRoleFromClaims(sessionClaims: unknown): AppRole {
  const claims = asObject(sessionClaims);
  if (!claims) {
    return "viewer";
  }

  const metadata = asObject(claims.metadata);
  const publicMetadata = asObject(claims.public_metadata);
  const directRole = asString(claims.role);

  const roleCandidate =
    asString(metadata?.role) ??
    asString(publicMetadata?.role) ??
    directRole ??
    "viewer";

  return isAppRole(roleCandidate) ? roleCandidate : "viewer";
}

function readDisplayNameFromClaims(
  sessionClaims: unknown,
  userId: string,
  role: AppRole,
): string {
  const claims = asObject(sessionClaims);
  if (!claims) {
    return `${getRoleLabel(role)} (${userId.slice(0, 8)})`;
  }

  const value =
    asString(claims.name) ??
    asString(claims.full_name) ??
    asString(claims.given_name) ??
    asString(claims.email);

  return value ?? `${getRoleLabel(role)} (${userId.slice(0, 8)})`;
}

function signInUrl(nextPath: string): string {
  const safeNextPath = normalizeNextPath(nextPath);
  return `/sign-in?redirect_url=${encodeURIComponent(safeNextPath)}`;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return null;
  }

  const role = readRoleFromClaims(sessionClaims);
  const displayName = readDisplayNameFromClaims(sessionClaims, userId, role);

  return {
    userId,
    displayName,
    role,
    roleLabel: getRoleLabel(role),
  };
}

export async function requirePageAuth(nextPath: string): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    redirect(signInUrl(nextPath));
  }
  return context;
}

export async function requirePagePermission(
  permission: AppPermission,
  nextPath: string,
): Promise<AuthContext> {
  const context = await requirePageAuth(nextPath);
  if (!hasPermission(context.role, permission)) {
    redirect("/forbidden");
  }
  return context;
}

export async function requireActionPermission(
  permission: AppPermission,
  nextPath: string,
): Promise<AuthContext> {
  return requirePagePermission(permission, nextPath);
}

export async function requireApiPermission(permission: AppPermission): Promise<
  { ok: true; context: AuthContext } | { ok: false; response: Response }
> {
  const context = await getAuthContext();
  if (!context) {
    return {
      ok: false,
      response: Response.json(
        { message: "Unauthorized: sign in is required." },
        { status: 401 },
      ),
    };
  }

  if (!hasPermission(context.role, permission)) {
    return {
      ok: false,
      response: Response.json(
        { message: "Forbidden: missing required role permission." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, context };
}

export function can(context: AuthContext, permission: AppPermission): boolean {
  return getRolePermissions(context.role).includes(permission);
}
