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
  md: "text-xl sm:text-2xl",
  lg: "text-3xl sm:text-4xl",
} as const;

export function ProductPrice({ price, previousPrice, size = "sm", className }: ProductPriceProps) {
  const showPrevious = previousPrice != null && previousPrice > price;

  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("font-black leading-none tracking-tight text-[#ff4d00]", sizeClass[size])}>{formatCOP(price)}</p>
      {showPrevious ? (
        <p className="mt-1 text-xs font-black text-stone-400 line-through">{formatCOP(previousPrice)}</p>
      ) : null}
    </div>
  );
}
