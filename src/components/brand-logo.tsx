import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  label?: string;
  sublabel?: string;
  dark?: boolean;
  compact?: boolean;
  /** Show ATRES text beside the mark (useful when the icon alone is too small). */
  withWordmark?: boolean;
};

export function BrandLogo({
  href = "/",
  label = "ATRES",
  sublabel,
  dark = false,
  compact = false,
  withWordmark = false,
}: BrandLogoProps) {
  const showWordmark = withWordmark || Boolean(sublabel);

  const content = (
    <>
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-black/10 ${
          compact ? "h-9 w-9" : "h-12 w-12"
        }`}
      >
        <Image
          src="/icono.png"
          alt=""
          width={compact ? 36 : 48}
          height={compact ? 36 : 48}
          priority
          unoptimized
          className="h-full w-full object-contain p-0.5"
        />
      </span>
      {showWordmark ? (
        <span className={`min-w-0 ${compact ? "max-[360px]:hidden" : ""}`}>
          <span
            className={`block font-medium leading-none tracking-[0.14em] ${
              compact ? "text-[0.95rem]" : "text-2xl"
            } ${dark ? "text-white" : "text-ink"}`}
          >
            {label}
          </span>
          {sublabel ? (
            <span
              className={`mt-1 block text-[10px] font-normal tracking-wide ${
                dark ? "text-white/55" : "text-ink-muted"
              }`}
            >
              {sublabel}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  return (
    <Link
      href={href}
      className={`inline-flex min-w-0 items-center ${compact ? "gap-1.5" : "gap-2.5"}`}
      aria-label={label}
    >
      {content}
    </Link>
  );
}
