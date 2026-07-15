import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  label?: string;
  sublabel?: string;
  dark?: boolean;
  compact?: boolean;
};

export function BrandLogo({
  href = "/",
  label = "ATRES",
  sublabel,
  dark = false,
  compact = false,
}: BrandLogoProps) {
  const content = (
    <>
      <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[10px] ${compact ? "size-10" : "size-12"} bg-white shadow-sm ring-1 ring-black/10`}>
        <Image
          src="/icono.png"
          alt=""
          fill
          sizes={compact ? "40px" : "48px"}
          priority
          className="object-contain p-1"
        />
      </span>
      <span className="min-w-0">
        <span className={`block font-black leading-none tracking-[0.18em] ${compact ? "text-xl" : "text-2xl"} ${dark ? "text-white" : "text-black"}`}>
          {label}
        </span>
        {sublabel ? (
          <span className={`mt-1 block text-[10px] font-black uppercase tracking-wide ${dark ? "text-white/60" : "text-stone-500"}`}>
            {sublabel}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      {content}
    </Link>
  );
}
