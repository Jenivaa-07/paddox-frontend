import { cn } from "@/lib/utils";

export function CommandCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.055] p-6 shadow-command backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-paddox-red/45 hover:bg-white/[.075]",
        className
      )}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-paddox-red/15 blur-3xl transition duration-500 group-hover:bg-paddox-red/25" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
