import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "panel";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[.16em] transition duration-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-paddox-red text-white shadow-redGlow hover:-translate-y-0.5 hover:bg-red-600",
        variant === "ghost" && "border border-white/15 bg-white/5 text-white hover:border-paddox-red/60 hover:bg-paddox-red/10",
        variant === "panel" && "border border-white/10 bg-paddox-panel text-white hover:border-white/25 hover:bg-paddox-soft",
        className
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: "primary" | "ghost" | "panel";
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({ className, variant = "primary", children, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[.16em] transition duration-300",
        variant === "primary" && "bg-paddox-red text-white shadow-redGlow hover:-translate-y-0.5 hover:bg-red-600",
        variant === "ghost" && "border border-white/15 bg-white/5 text-white hover:border-paddox-red/60 hover:bg-paddox-red/10",
        variant === "panel" && "border border-white/10 bg-paddox-panel text-white hover:border-white/25 hover:bg-paddox-soft",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
