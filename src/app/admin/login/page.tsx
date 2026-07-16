import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/admin/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const metadata = {
  title: "Login admin | ATRES",
};

export default function AdminLoginPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(3,16,34,0.38)] ring-1 ring-[#284a68]">
        <div className="mb-5">
          <BrandLogo href="/admin/login" label="ATRES" sublabel="Admin" />
        </div>
        <p className="text-xs font-black uppercase text-zinc-500">Panel privado</p>
        <h1 className="mt-2 text-3xl font-black">ATRES Admin</h1>
        <p className="mt-2 text-sm font-semibold text-zinc-500">
          Ingresa con el correo del administrador principal.
        </p>
        {!configured ? (
          <p className="mt-4 bg-[#eef6ff] p-3 text-sm font-bold text-[#0b1f3a]">
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
