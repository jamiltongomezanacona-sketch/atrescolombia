import Link from "next/link";

type HomeSectionHeaderProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
};

export function HomeSectionHeader({
  id,
  eyebrow,
  title,
  href,
  linkLabel = "Ver todo",
}: HomeSectionHeaderProps) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3 sm:mb-2.5">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-wide text-brand">{eyebrow}</p>
        ) : null}
        <h2
          id={id}
          className={`${eyebrow ? "mt-0.5" : ""} text-lg font-medium tracking-tight text-ink sm:text-xl md:text-2xl`}
        >
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline sm:text-sm"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
