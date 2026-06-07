import { CommandCard } from "@/components/ui/command-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { HomeHero } from "@/components/home/hero";

const roadmap = [
  "R1 Foundation",
  "R2 Premium Home",
  "R3 Fan Hub",
  "R4 Shop + Checkout",
  "R5 Account",
  "R6 Admin",
  "R7 Stabilization"
];

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <section className="py-16">
        <div className="paddox-container">
          <SectionHeading eyebrow="Migration Roadmap" title="One phase. One ZIP. Test. Lock. Next.">
            This R1 package is the safe base for the full PADDOX premium Next.js rebuild. The old HTML/CSS/JS frontend remains untouched.
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((item, index) => (
              <CommandCard key={item} className="p-5">
                <p className="text-xs font-black uppercase tracking-[.28em] text-paddox-red">Phase {index + 1}</p>
                <h3 className="mt-3 font-display text-xl font-black uppercase tracking-[-.04em] text-white">{item}</h3>
                <p className="mt-4 text-sm leading-6 text-paddox-muted">
                  {index === 0 ? "Current foundation phase." : "Upcoming premium rebuild phase."}
                </p>
              </CommandCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
