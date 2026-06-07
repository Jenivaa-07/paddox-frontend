import { ArrowRight, CalendarDays, CircleGauge, Gem, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CommandCard } from "@/components/ui/command-card";

const stats = [
  { label: "Season Calendar", value: "24", sub: "Grand Prix weekends" },
  { label: "Fan System", value: "250+", sub: "community target" },
  { label: "Drop Store", value: "50+", sub: "product-ready architecture" }
];

export function HomeHero() {
  return (
    <section className="surface-line relative overflow-hidden py-16 md:py-24">
      <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-paddox-red/20 blur-[110px]" />
      <div className="paddox-container relative z-10 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.26em] text-paddox-muted backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-paddox-red shadow-redGlow" />
            Next.js Luxury Migration · R1
          </div>

          <h1 className="font-display text-5xl font-black uppercase leading-[.86] tracking-[-.08em] text-white md:text-7xl xl:text-8xl">
            Build the new age of <span className="text-paddox-red">fan racing</span> luxury.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-paddox-muted md:text-lg">
            PADDOX is moving into a React/Next.js premium system built for immersive fan journeys, collectible race identity, luxury drops, and admin-powered content control.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/fanhub">
              Explore Fan Hub <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/admin" variant="ghost">
              Open Command Center
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[.045] p-4 backdrop-blur-lg">
                <p className="font-display text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[.18em] text-paddox-red">{stat.label}</p>
                <p className="mt-2 text-xs text-paddox-muted">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <CommandCard className="min-h-[520px] p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.34em] text-paddox-red">Race Command</p>
              <h2 className="mt-3 font-display text-4xl font-black uppercase tracking-[-.06em] text-white">PADDOX Control Deck</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
              <CircleGauge className="h-7 w-7 text-paddox-red" />
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[.2em] text-paddox-muted">
              <span>System Status</span>
              <span className="text-paddox-red">Online</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[72%] rounded-full bg-paddox-red shadow-redGlow" />
            </div>
            <p className="mt-4 text-sm leading-6 text-paddox-muted">Foundation ready for Home, Fan Hub, Shop, Account, Admin, badges, stamps, and race passport systems.</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { icon: CalendarDays, label: "Race Passport", text: "Collect GP stamps and identity milestones." },
              { icon: Gem, label: "Badge Vault", text: "Luxury achievement collectibles." },
              { icon: ShieldCheck, label: "Admin Control", text: "Manage content without code." },
              { icon: CircleGauge, label: "Track Mode", text: "Premium circuit visual direction." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/[.04] p-4 transition hover:border-paddox-red/40 hover:bg-white/[.07]">
                  <Icon className="mb-4 h-6 w-6 text-paddox-red" />
                  <p className="font-display text-sm font-black uppercase tracking-[.12em] text-white">{item.label}</p>
                  <p className="mt-2 text-xs leading-5 text-paddox-muted">{item.text}</p>
                </div>
              );
            })}
          </div>
        </CommandCard>
      </div>
    </section>
  );
}
