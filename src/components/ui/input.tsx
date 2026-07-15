import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

const fieldClass =
  "h-11 w-full border border-zinc-300 bg-white px-3 text-sm font-semibold transition focus:border-black";

const storeFieldClass =
  "h-11 w-full rounded-full border border-black/10 bg-white px-4 text-sm font-semibold transition focus:border-brand";

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label ? <span>{label}</span> : null}
      <input id={inputId} className={cn(fieldClass, className)} {...props} />
    </label>
  );
}

export function StoreInput({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  if (!label) {
    return <input id={inputId} className={cn(storeFieldClass, className)} {...props} />;
  }

  return (
    <label className="grid gap-1.5 text-sm font-bold text-stone-700">
      <span>{label}</span>
      <input id={inputId} className={cn(storeFieldClass, className)} {...props} />
    </label>
  );
}

export function TextArea({ label, className, id, ...props }: TextAreaProps) {
  const areaId = id ?? props.name;

  return (
    <label className="grid gap-1.5 text-sm font-bold text-zinc-700">
      {label ? <span>{label}</span> : null}
      <textarea
        id={areaId}
        className={cn(
          "w-full border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold transition focus:border-black",
          className,
        )}
        {...props}
      />
    </label>
  );
}
