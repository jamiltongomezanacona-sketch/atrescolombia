import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-black text-white hover:bg-stone-800",
  metal: "bg-[#0b1f3a] text-white hover:bg-[#123052]",
  brand: "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-white text-black ring-1 ring-black/10 hover:bg-stone-100",
  ghost: "bg-transparent text-inherit hover:bg-black/5",
} as const;

const sizes = {
  sm: "h-10 px-3 text-xs",
  md: "h-12 px-4 text-sm",
  lg: "h-12 w-full px-4 text-sm",
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
  "inline-flex items-center justify-center rounded-full font-black transition disabled:opacity-50";

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
