import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-ink text-white shadow-soft hover:bg-stone-800 hover:shadow-press",
  metal:
    "bg-[#161616] text-white shadow-soft hover:bg-[#2a2a2a] hover:shadow-press",
  brand:
    "bg-brand text-white shadow-soft hover:bg-brand-hover hover:shadow-press",
  secondary:
    "bg-surface text-ink ring-1 ring-black/10 shadow-sm hover:bg-surface-muted hover:ring-black/15",
  ghost: "bg-transparent text-inherit hover:bg-black/[0.04]",
} as const;

const sizes = {
  sm: "min-h-10 px-3.5 text-xs",
  md: "min-h-12 px-4 text-sm",
  lg: "min-h-12 w-full px-4 text-sm",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  type?: never;
  disabled?: never;
  onClick?: never;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClass =
  "atres-interactive inline-flex items-center justify-center rounded-[var(--radius-card)] font-medium outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = cn(baseClass, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, ...linkRest } = props;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
