import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  if (!hasSupabaseEnv()) {
    return { user: null, isConfigured: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, isConfigured: true };
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session.isConfigured) {
    redirect("/admin/login");
  }

  if (!session.user) {
    redirect("/admin/login");
  }

  return session;
}
