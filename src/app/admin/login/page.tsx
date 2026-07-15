import { LoginForm } from "@/components/admin/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const metadata = {
  title: "Login admin | ATRES",
};

export default function AdminLoginPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-md bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase text-zinc-500">Panel privado</p>
        <h1 className="mt-2 text-3xl font-black">ATRES Admin</h1>
        <p className="mt-2 text-sm font-semibold text-zinc-500">
          Ingresa con el correo del administrador principal.
        </p>
        {!configured ? (
          <p className="mt-4 bg-amber-50 p-3 text-sm font-bold text-amber-800">
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
