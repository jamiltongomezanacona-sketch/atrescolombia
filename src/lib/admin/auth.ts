import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/admin/types";

export type AdminSession = {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isShopAdmin: boolean;
  isConfigured: boolean;
  role: ProfileRole | null;
  shopIds: string[];
  primaryShopId: string | null;
};

export async function getAdminSession() {
  if (!hasSupabaseEnv()) {
    return emptySession(false);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptySession(true);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = normalizeRole(profile?.role);
  const shopMemberships = await getShopMemberships(user.id);
  const isSuperAdmin = role === "admin" || role === "superadmin" || shopMemberships.some((member) => member.role === "superadmin");
  const shopIds = shopMemberships
    .filter((member) => member.role === "shop_admin")
    .map((member) => member.shop_id);
  // Shop admins must have an active membership row (aligned with middleware + RLS).
  const isShopAdmin = shopIds.length > 0;

  return {
    user,
    role,
    isConfigured: true,
    isAdmin: isSuperAdmin || isShopAdmin,
    isSuperAdmin,
    isShopAdmin,
    shopIds,
    primaryShopId: shopIds[0] ?? null,
  } satisfies AdminSession;
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session.isConfigured) {
    redirect("/admin/login");
  }

  if (!session.user) {
    redirect("/admin/login");
  }

  if (!session.isAdmin) {
    redirect("/admin/login?unauthorized=1");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();

  if (!session.isSuperAdmin) {
    redirect("/admin/productos");
  }

  return session;
}

function emptySession(isConfigured: boolean): AdminSession {
  return {
    user: null,
    role: null,
    isConfigured,
    isAdmin: false,
    isSuperAdmin: false,
    isShopAdmin: false,
    shopIds: [],
    primaryShopId: null,
  };
}

function normalizeRole(role: unknown): ProfileRole | null {
  if (role === "admin" || role === "superadmin" || role === "shop_admin") return role;
  return null;
}

async function getShopMemberships(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("shop_members")
      .select("shop_id,role")
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) return [];
    return (data ?? []) as Array<{ shop_id: string; role: "superadmin" | "shop_admin" }>;
  } catch {
    return [];
  }
}
