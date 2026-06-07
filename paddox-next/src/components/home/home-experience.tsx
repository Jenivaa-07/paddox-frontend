"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Crown,
  Flame,
  Gem,
  Gauge,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 }
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09
    }
  }
};

const raceStats = [
  { value: "24", label: "Race weekends", caption: "Season calendar" },
  { value: "250+", label: "Fan target", caption: "Community system" },
  { value: "50+", label: "Product-ready", caption: "Store architecture" }
];

const commandTiles = [
  { icon: CalendarDays, title: "Race Passport", text: "Collect GP stamps, unlock country memories, and build a season identity." },
  { icon: Gem, title: "Badge Vault", text: "Luxury achievement collectibles with rarity, status, and fan value." },
  { icon: ShoppingBag, title: "Luxury Drops", text: "Featured merch, limited collections, coupons, and checkout-ready flow." },
  { icon: ShieldCheck, title: "Admin Powered", text: "Products, quotes, polls, trivia, wallpapers, badges, and stamps from admin." }
];

const raceLab = [
  { label: "Prediction", title: "Fantasy Race Call", value: "Strategy locked", icon: Gauge },
  { label: "Collect", title: "Badge Vault", value: "Luxury rarity", icon: Trophy },
  { label: "Travel", title: "Race Passport", value: "Stamp journey", icon: BadgeCheck }
];

const merchPreview = [
  { tag: "Featured", title: "Team Drop Capsule", price: "Admin synced", icon: PackageCheck },
  { tag: "Digital", title: "Premium Wallpapers", price: "Download flow", icon: Sparkles },
  { tag: "Limited", title: "Collector Posters", price: "Drop ready", icon: Crown }
];

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      <p className="mb-3 text-xs font-black uppercase tracking-[.48em] text-paddox-red">{eyebrow}</p>
      <h2 className="font-display text-4xl font-black uppercase leading-[.92] tracking-[-.07em] text-white md:text-6xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-paddox-muted md:text-base">{children}</p>
    </motion.div>
  );
}

function LuxuryPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.055] shadow-command backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-paddox-red/45 hover:bg-white/[.075]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-paddox-red/15 blur-3xl transition duration-700 group-hover:bg-paddox-red/25" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.08),transparent_42%)] opacity-70" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TrackPreview() {
  return (
    <LuxuryPanel className="p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.42em] text-paddox-red">Track Mode</p>
          <h3 className="mt-3 font-display text-3xl font-black uppercase tracking-[-.06em] text-white">Circuit Pulse</h3>
        </div>
        <span className="rounded-full border border-paddox-red/35 bg-paddox-red/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.24em] text-white">Visual core</span>
      </div>

      <div className="relative mt-8 h-72 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/45">
        <div className="absolute inset-0 bg-trackGrid bg-[length:36px_36px] opacity-35" />
        <div className="absolute left-1/2 top-1/2 h-[230px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[46%] border-[12px] border-white/10" />
        <div className="absolute left-[18%] top-[24%] h-[150px] w-[290px] rounded-[45%] border-[3px] border-paddox-red/75 shadow-redGlow" />
        <motion.span
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "linear" }}
          className="absolute left-[18%] top-[24%] h-4 w-4 rounded-full bg-paddox-red shadow-[0_0_30px_rgba(225,6,0,.9)] [offset-path:ellipse(145px_75px_at_145px_75px)]"
        />
        <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
          {["Race sync", "Circuit cards", "Live layer later"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[.18em] text-white/80">
              {item}
            </div>
          ))}
        </div>
      </div>
    </LuxuryPanel>
  );
}

export function HomeExperience() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(225,6,0,.22),transparent_30rem),radial-gradient(circle_at_80%_20%,rgba(255,255,255,.08),transparent_24rem),linear-gradient(180deg,#050505,#08090b_45%,#050505)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-trackGrid bg-[length:54px_54px] opacity-[.08]" />

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden py-14 md:py-20">
        <div className="absolute left-0 top-10 h-80 w-1/2 bg-gradient-to-r from-paddox-red/16 to-transparent blur-3xl" />
        <div className="paddox-container relative grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={reveal} transition={{ duration: 0.55 }} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.055] px-4 py-3 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-paddox-red shadow-[0_0_20px_rgba(225,6,0,.9)]" />
              <span className="text-[11px] font-black uppercase tracking-[.32em] text-white/70">Next.js Luxury Rebuild · R2 Home</span>
            </motion.div>

            <motion.h1 variants={reveal} transition={{ duration: 0.6 }} className="mt-7 max-w-5xl font-display text-[4.8rem] font-black uppercase leading-[.82] tracking-[-.095em] text-white md:text-[7rem] xl:text-[8.4rem]">
              Enter the <span className="text-paddox-red">Paddock</span>. Own the race.
            </motion.h1>

            <motion.p variants={reveal} transition={{ duration: 0.6 }} className="mt-7 max-w-2xl text-base leading-8 text-paddox-muted md:text-lg">
              PADDOX is being rebuilt as a premium motorsport experience: live race energy, luxury drops, collectible badges, GP stamps, Race Passport, and admin-powered content control.
            </motion.p>

            <motion.div variants={reveal} transition={{ duration: 0.6 }} className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/fanhub" className="gap-2">Explore Fan Hub <ArrowRight className="h-4 w-4" /></ButtonLink>
              <ButtonLink href="/shop" variant="ghost" className="gap-2">View Luxury Drops <ShoppingBag className="h-4 w-4" /></ButtonLink>
            </motion.div>

            <motion.div variants={stagger} className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {raceStats.map((stat) => (
                <motion.div key={stat.label} variants={reveal} className="rounded-[1.45rem] border border-white/10 bg-white/[.055] p-5 backdrop-blur-xl transition hover:border-paddox-red/40 hover:bg-white/[.075]">
                  <p className="font-display text-4xl font-black tracking-[-.07em] text-white">{stat.value}</p>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[.25em] text-paddox-red">{stat.label}</p>
                  <p className="mt-2 text-xs text-paddox-muted">{stat.caption}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <LuxuryPanel className="p-7 lg:p-9">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.42em] text-paddox-red">Race Command</p>
                  <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none tracking-[-.06em] text-white">PADDOX Control Deck</h2>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-paddox-red/35 bg-paddox-red/10 text-paddox-red shadow-redGlow">
                  <Zap className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-black/45 p-5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[.28em] text-paddox-muted">
                  <span>System status</span>
                  <span className="text-paddox-red">Online</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div initial={{ width: "16%" }} animate={{ width: "78%" }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full bg-paddox-red shadow-redGlow" />
                </div>
                <p className="mt-4 text-sm leading-6 text-paddox-muted">Home luxury shell ready. Next connections: backend products, quotes, wallpapers, polls, trivia, badges, stamps, and passport assets.</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {commandTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <div key={tile.title} className="rounded-[1.45rem] border border-white/10 bg-white/[.045] p-5 transition hover:border-paddox-red/45 hover:bg-white/[.075]">
                      <Icon className="h-5 w-5 text-paddox-red" />
                      <h3 className="mt-5 font-display text-lg font-black uppercase tracking-[-.04em] text-white">{tile.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-paddox-muted">{tile.text}</p>
                    </div>
                  );
                })}
              </div>
            </LuxuryPanel>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="paddox-container">
          <SectionIntro eyebrow="Experience Layers" title="Not a page. A racing identity system.">
            R2 upgrades Home into a premium entry point for the final PADDOX ecosystem. These cards are layout shells now, ready for real backend data in the next phases.
          </SectionIntro>

          <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
            <TrackPreview />
            <LuxuryPanel className="p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.42em] text-paddox-red">Race Lab</p>
                  <h3 className="mt-3 font-display text-3xl font-black uppercase tracking-[-.06em] text-white">Command Modules</h3>
                </div>
                <Flame className="h-8 w-8 text-paddox-red" />
              </div>
              <div className="mt-8 grid gap-4">
                {raceLab.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="group flex items-center justify-between gap-5 rounded-[1.5rem] border border-white/10 bg-black/35 p-5 transition hover:border-paddox-red/45 hover:bg-paddox-red/10"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[.06] text-paddox-red">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.28em] text-paddox-red">{item.label}</p>
                          <h4 className="mt-1 font-display text-xl font-black uppercase tracking-[-.04em] text-white">{item.title}</h4>
                        </div>
                      </div>
                      <span className="hidden rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.22em] text-white/70 sm:inline-flex">{item.value}</span>
                    </motion.div>
                  );
                })}
              </div>
            </LuxuryPanel>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="paddox-container">
          <SectionIntro eyebrow="Luxury Store Preview" title="Drops, downloads, and collectibles in one premium flow.">
            This section prepares the Home page for real featured products, premium wallpapers, and collectible items from the existing Admin system.
          </SectionIntro>
          <div className="grid gap-5 md:grid-cols-3">
            {merchPreview.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <LuxuryPanel className="h-full p-6">
                    <div className="flex h-56 items-center justify-center rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_50%_25%,rgba(225,6,0,.2),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02))]">
                      <Icon className="h-16 w-16 text-paddox-red drop-shadow-[0_0_24px_rgba(225,6,0,.55)]" />
                    </div>
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[.3em] text-paddox-red">{item.tag}</p>
                    <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-[-.05em] text-white">{item.title}</h3>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-paddox-muted">{item.price}</span>
                      <Link href="/shop" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[.06] text-white transition hover:border-paddox-red/50 hover:bg-paddox-red">
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </LuxuryPanel>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 pb-24 md:py-20">
        <div className="paddox-container">
          <LuxuryPanel className="p-7 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[.42em] text-paddox-red">R2 Lock Target</p>
                <h2 className="mt-4 font-display text-4xl font-black uppercase leading-[.9] tracking-[-.07em] text-white md:text-6xl">Home is now ready for final data connections.</h2>
                <p className="mt-5 text-sm leading-7 text-paddox-muted">Next after screenshot approval: connect real Home sections step by step and continue into Fan Hub, Shop, Account, and Admin rebuilds.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["No old frontend damage", "Backend remains safe", "21st.dev style direction", "Ready for screenshot polish"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-black/35 px-4 py-4 text-sm font-bold text-white/85">
                    <CircleDot className="h-4 w-4 text-paddox-red" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </LuxuryPanel>
        </div>
      </section>
    </div>
  );
}
