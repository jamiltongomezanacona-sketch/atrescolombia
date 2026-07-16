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
  const size = compact ? 34 : 48;

  const content = (
    <>
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/10 ${
          compact ? "h-[34px] w-[34px]" : "h-12 w-12"
        }`}
      >
        <Image
          src="/icono.png"
          alt=""
          width={size}
          height={size}
          priority
          className="h-full w-full object-contain p-1"
        />
      </span>
      <span className="min-w-0">
        <span
          className={`block font-black leading-none tracking-[0.18em] ${compact ? "text-lg" : "text-2xl"} ${
            dark ? "text-white" : "text-black"
          }`}
        >
          {label}
        </span>
        {sublabel ? (
          <span
            className={`mt-1 block text-[10px] font-black uppercase tracking-wide ${
              dark ? "text-white/60" : "text-stone-500"
            }`}
          >
            {sublabel}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      {content}
    </Link>
  );
}
