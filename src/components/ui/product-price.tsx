import { formatCOP } from "@/lib/store-data";
import { cn } from "@/lib/cn";

type ProductPriceProps = {
  price: number;
  previousPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  currentClassName?: string;
  previousClassName?: string;
};

const sizeClass = {
  sm: "text-base sm:text-lg",
  md: "text-lg sm:text-xl",
  lg: "text-2xl sm:text-3xl",
} as const;

export function ProductPrice({
  price,
  previousPrice,
  size = "sm",
  className,
  currentClassName,
  previousClassName,
}: ProductPriceProps) {
  const showPrevious = previousPrice != null && previousPrice > price;

  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "font-medium leading-none tracking-tight text-brand",
          sizeClass[size],
          currentClassName,
        )}
      >
        {formatCOP(price)}
      </p>
      {showPrevious ? (
        <p
          className={cn(
            "mt-1 text-xs font-normal text-ink-muted/80 line-through decoration-ink-muted/50",
            previousClassName,
          )}
        >
          {formatCOP(previousPrice)}
        </p>
      ) : null}
    </div>
  );
}
