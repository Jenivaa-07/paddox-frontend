export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 py-10">
      <div className="paddox-container flex flex-col gap-4 text-sm text-paddox-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-black uppercase text-white">PADDO<span className="paddox-x">X</span></p>
          <p>Premium motorsport lifestyle, fan culture, and collectibles.</p>
        </div>
        <p className="uppercase tracking-[.24em]">Next.js Luxury Foundation · Phase R1</p>
      </div>
    </footer>
  );
}
