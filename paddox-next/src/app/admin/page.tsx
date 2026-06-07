import { CommandCard } from "@/components/ui/command-card";
import { SectionHeading } from "@/components/ui/section-heading";

export default function Page() {
  return (
    <section className="min-h-[72vh] py-20">
      <div className="paddox-container">
        <SectionHeading eyebrow="PADDOX Route Ready" title="Admin">
          This route is prepared for the upcoming premium rebuild phase. R1 only creates the safe foundation and page structure.
        </SectionHeading>
        <CommandCard className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[.3em] text-paddox-red">Coming in next phases</p>
          <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-[-.06em] text-white">Admin Luxury Rebuild</h1>
          <p className="mt-5 text-paddox-muted">This page will be connected to the existing PADDOX backend and upgraded with premium UI, motion, and admin-controlled data.</p>
        </CommandCard>
      </div>
    </section>
  );
}
