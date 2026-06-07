export function SectionHeading({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-xs font-black uppercase tracking-[.42em] text-paddox-red">{eyebrow}</p>
      <h2 className="font-display text-3xl font-black uppercase tracking-[-.04em] text-white md:text-5xl">
        {title}
      </h2>
      {children ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-paddox-muted md:text-base">{children}</p> : null}
    </div>
  );
}
