import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "theme-primary-button",
  metal:
    "theme-secondary-button",
  brand:
    "theme-primary-button",
  secondary:
    "theme-secondary-button",
  ghost: "bg-transparent text-inherit hover:bg-white/[0.06]",
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
  "atres-interactive inline-flex items-center justify-center rounded-[var(--radius-card)] font-medium outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none";

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
