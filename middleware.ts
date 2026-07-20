import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  let isSuperAdmin = false;
  let isShopAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isSuperAdmin = profile?.role === "admin" || profile?.role === "superadmin";

    const { data: memberships } = await supabase
      .from("shop_members")
      .select("shop_id,role,status")
      .eq("user_id", user.id)
      .eq("status", "active");

    isShopAdmin = (memberships ?? []).some((member) => member.role === "shop_admin");
    isSuperAdmin =
      isSuperAdmin || (memberships ?? []).some((member) => member.role === "superadmin");
    isAdmin = isSuperAdmin || isShopAdmin;
  }

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && !isAdmin && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(url);
  }

  if (user && isShopAdmin && !isSuperAdmin && isSuperAdminOnlyRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/productos";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isAdmin && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = isSuperAdmin ? "/admin" : "/admin/productos";
    return NextResponse.redirect(url);
  }

  return response;
}

function isSuperAdminOnlyRoute(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/tiendas") ||
    pathname.startsWith("/admin/categorias") ||
    pathname.startsWith("/admin/banners") ||
    pathname.startsWith("/admin/promociones")
  );
}

export const config = {
  matcher: ["/admin/:path*"],
};
