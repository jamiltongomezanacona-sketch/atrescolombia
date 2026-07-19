import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/admin/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const metadata = {
  title: "Login admin",
};

export default function AdminLoginPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <section className="w-full max-w-md rounded-[var(--radius-card)] bg-surface p-6 shadow-lift ring-1 ring-black/5 sm:p-7">
        <div className="mb-5">
          <BrandLogo href="/admin/login" label="ATRES" sublabel="Admin" />
        </div>
        <p className="text-[11px] font-medium tracking-wide text-ink-muted">Panel privado</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">ATRES Admin</h1>
        <p className="mt-2 text-sm font-normal text-ink-muted">
          Ingresa con el correo del administrador principal.
        </p>
        {!configured ? (
          <p className="mt-4 rounded-[var(--radius-card)] bg-surface-muted p-3 text-sm font-medium text-ink">
            Supabase no esta configurado. Agrega las variables de entorno para habilitar el acceso.
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
