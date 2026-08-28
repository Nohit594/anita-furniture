"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Users,
  Sofa,
  IndianRupee,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);
  return <>{display}</>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ClipboardList,
      href: "/admin/orders",
    },
    {
      label: "Pending Review",
      value: stats?.pending ?? 0,
      icon: Clock,
      href: "/admin/orders?status=pending",
    },
    {
      label: "Paid Orders",
      value: stats?.paid ?? 0,
      icon: CheckCircle2,
      href: "/admin/orders?status=paid",
    },
    {
      label: "Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Catalogue Items",
      value: stats?.catalogueCount ?? 0,
      icon: Sofa,
      href: "/admin/catalogue",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-espresso/60">Overview of your store.</p>

      {/* Revenue highlight */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex items-center justify-between rounded-3xl bg-warm-gradient p-6 text-white shadow-warm-lg"
      >
        <div>
          <p className="text-sm font-medium text-white/80">Total Revenue</p>
          <p className="mt-1 font-display text-4xl font-bold">
            {formatCurrency(stats?.revenue ?? 0)}
          </p>
        </div>
        <IndianRupee size={48} className="text-white/40" />
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={c.href}
              className="card flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-warm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <c.icon size={24} />
              </div>
              <div>
                <p className="font-display text-3xl font-bold">
                  <Counter value={c.value} />
                </p>
                <p className="text-sm text-espresso/60">{c.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
