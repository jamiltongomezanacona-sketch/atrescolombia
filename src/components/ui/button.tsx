import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-black text-white shadow-[0_10px_26px_rgba(0,0,0,0.16)] hover:bg-stone-800 hover:shadow-press",
  metal: "bg-[#0b1f3a] text-white shadow-[0_10px_26px_rgba(11,31,58,0.18)] hover:bg-[#123052] hover:shadow-press",
  brand: "bg-brand text-white shadow-[0_10px_26px_rgba(255,77,0,0.2)] hover:bg-brand-hover hover:shadow-press",
  secondary: "bg-white text-black ring-1 ring-black/10 shadow-sm hover:bg-stone-100 hover:ring-black/15",
  ghost: "bg-transparent text-inherit hover:bg-black/5",
} as const;

const sizes = {
  sm: "min-h-10 px-3 text-xs",
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
  "atres-interactive inline-flex items-center justify-center rounded-full font-medium outline-none disabled:pointer-events-none disabled:opacity-50";

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
