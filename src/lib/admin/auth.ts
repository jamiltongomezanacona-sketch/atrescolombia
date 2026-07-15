import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  if (!hasSupabaseEnv()) {
    return { user: null, isAdmin: false, isConfigured: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, isConfigured: true };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, isAdmin: profile?.role === "admin", isConfigured: true };
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
