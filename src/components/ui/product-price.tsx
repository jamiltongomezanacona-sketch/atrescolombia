import { formatCOP } from "@/lib/store-data";
import { cn } from "@/lib/cn";

type ProductPriceProps = {
  price: number;
  previousPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "text-base sm:text-lg",
  md: "text-lg sm:text-xl",
  lg: "text-2xl sm:text-3xl",
} as const;

export function ProductPrice({ price, previousPrice, size = "sm", className }: ProductPriceProps) {
  const showPrevious = previousPrice != null && previousPrice > price;

  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("font-black leading-none text-brand", sizeClass[size])}>{formatCOP(price)}</p>
      {showPrevious ? (
        <p className="mt-1 text-xs font-semibold text-stone-400 line-through">{formatCOP(previousPrice)}</p>
      ) : null}
    </div>
  );
}
