"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  Sofa,
  MapPin,
  ChevronDown,
  User,
  UserPlus,
} from "lucide-react";
import { useAddresses } from "@/components/AddressContext";
import { CategoryNav } from "@/components/CategoryNav";

const links = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/custom-order", label: "Custom Order" },
];

function DeliverTo() {
  const { data: session } = useSession();
  const { defaultAddress, openModal } = useAddresses();

  return (
    <button
      onClick={() => (session ? openModal() : signIn("google"))}
      className="hidden items-center gap-1.5 rounded-xl px-3 py-1.5 text-left transition hover:bg-sand lg:flex"
      title="Set delivery location"
    >
      <MapPin size={18} className="shrink-0 text-terracotta" />
      <span className="leading-tight">
        <span className="block text-[10px] uppercase tracking-wide text-espresso/50">
          Deliver to
        </span>
        <span className="block max-w-[160px] truncate text-sm font-semibold text-espresso">
          {defaultAddress
            ? `${defaultAddress.city} ${defaultAddress.pincode}`
            : session
              ? "Select location"
              : "Sign in"}
        </span>
      </span>
      <ChevronDown size={14} className="text-espresso/50" />
    </button>
  );
}

function ProfileMenu() {
  const { data: session } = useSession();
  const { openModal } = useAddresses();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link href="/login" className="btn-ghost !py-2 text-sm">
          <User size={16} /> Sign in
        </Link>
        <Link href="/signup" className="btn-primary !py-2 text-sm">
          <UserPlus size={16} /> Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-sand bg-white/70 py-1 pl-1 pr-3 transition hover:border-terracotta/40 hover:shadow-warm"
      >
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-gradient text-sm font-semibold text-white">
            {session.user?.name?.[0]?.toUpperCase() || "U"}
          </span>
        )}
        <span className="max-w-[90px] truncate text-sm font-medium">
          {session.user?.name?.split(" ")[0]}
        </span>
        <ChevronDown
          size={14}
          className={`text-espresso/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-sand bg-white shadow-warm-lg"
          >
            <div className="border-b border-sand bg-sand/40 px-4 py-3">
              <p className="truncate font-semibold">{session.user?.name}</p>
              <p className="truncate text-xs text-espresso/60">
                {session.user?.email}
              </p>
            </div>
            <div className="p-2">
              <MenuLink href="/account" icon={User} onClick={() => setOpen(false)}>
                My Profile
              </MenuLink>
              <MenuLink
                href="/orders"
                icon={Package}
                onClick={() => setOpen(false)}
              >
                My Orders
              </MenuLink>
              <button
                onClick={() => {
                  setOpen(false);
                  openModal();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-espresso/80 transition hover:bg-sand"
              >
                <MapPin size={16} /> Manage addresses
              </button>
              {isAdmin && (
                <MenuLink
                  href="/admin"
                  icon={LayoutDashboard}
                  onClick={() => setOpen(false)}
                >
                  Admin Panel
                </MenuLink>
              )}
            </div>
            <div className="border-t border-sand p-2">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-espresso/80 transition hover:bg-sand"
    >
      <Icon size={16} /> {children}
    </Link>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const { defaultAddress, openModal } = useAddresses();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="glass-nav sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-gradient text-white shadow-warm">
              <Sofa size={20} />
            </span>
            <span className="font-display text-xl font-bold text-espresso">
              Anita <span className="text-terracotta">Furniture</span>
            </span>
          </Link>
          <DeliverTo />
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-espresso/80 transition-colors hover:text-terracotta"
            >
              {l.label}
            </Link>
          ))}
          <ProfileMenu />
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-espresso md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      <CategoryNav />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-sand bg-cream md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {/* Deliver-to (mobile) */}
              <button
                onClick={() => {
                  setOpen(false);
                  session ? openModal() : signIn("google");
                }}
                className="mb-1 flex items-center gap-2 rounded-xl bg-sand px-4 py-3 text-left"
              >
                <MapPin size={18} className="text-terracotta" />
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-espresso/50">
                    Deliver to
                  </span>
                  <span className="block text-sm font-semibold">
                    {defaultAddress
                      ? `${defaultAddress.city} ${defaultAddress.pincode}`
                      : "Set your location"}
                  </span>
                </span>
              </button>

              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 font-medium text-espresso hover:bg-sand"
                >
                  {l.label}
                </Link>
              ))}
              {session ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 font-medium text-espresso hover:bg-sand"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 font-medium text-espresso hover:bg-sand"
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-4 py-3 font-medium text-espresso hover:bg-sand"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={() => signOut()} className="btn-ghost mt-2">
                    <LogOut size={16} /> Sign out
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-ghost justify-center"
                  >
                    <User size={16} /> Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary justify-center"
                  >
                    <UserPlus size={16} /> Create account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
