import Link from "next/link";
import { Gauge, ShoppingBag, Sparkles, Trophy, UserCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: Gauge },
  { href: "/fanhub", label: "Fan Hub", icon: Sparkles },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: UserCircle },
  { href: "/admin", label: "Admin", icon: Trophy }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-2xl">
      <div className="paddox-container flex min-h-20 items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-paddox-red/40 bg-gradient-to-br from-white/12 to-paddox-red/20 shadow-redGlow">
            <span className="h-5 w-5 rounded-full border-2 border-white/85 border-r-paddox-red" />
          </span>
          <span className="font-display text-2xl font-black uppercase tracking-[-.06em] text-white">
            PADDO<span className="paddox-x">X</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-paddox-muted transition hover:bg-white/7 hover:text-white"
              >
                <Icon className="h-4 w-4 text-paddox-red/80 transition group-hover:text-paddox-red" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <ButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
          Enter Paddock
        </ButtonLink>
      </div>
    </header>
  );
}
