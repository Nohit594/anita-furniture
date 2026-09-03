"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  X,
  Home,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  price_set: "Price sent",
  customer_accepted: "Payment pending",
  customer_countered: "Countered",
  paid: "Paid",
  in_production: "In production",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-600",
  price_set: "bg-orange-100 text-orange-700",
  customer_accepted: "bg-orange-100 text-orange-700",
  customer_countered: "bg-purple-100 text-purple-700",
  paid: "bg-emerald-100 text-emerald-700",
  in_production: "bg-sky-100 text-sky-700",
  completed: "bg-green-100 text-green-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openUser = async (u: any) => {
    setSelected({ ...u, _loading: true });
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/users/${u._id}`);
      const data = await res.json();
      setSelected(data);
    } finally {
      setDetailLoading(false);
    }
  };

  const update = async (userId: string, body: any, msg: string) => {
    setBusyId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...body }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success(msg);
      load();
      // Refresh the detail panel if open for the same user
      if (selected?._id === userId) openUser({ _id: userId });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex gap-6">
      {/* ── User list ── */}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="mt-1 text-espresso/60">Click a user to view their details.</p>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => openUser(u)}
                className={cn(
                  "flex cursor-pointer flex-wrap items-center gap-4 rounded-2xl border p-4 transition hover:shadow-md",
                  selected?._id === u._id
                    ? "border-terracotta bg-terracotta/5 shadow-md"
                    : u.isActive
                      ? "border-sand bg-white"
                      : "border-red-200 bg-red-50/50"
                )}
              >
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.image} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand font-semibold text-terracotta">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {u.name}
                    {u.role === "admin" && (
                      <span className="ml-2 rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-semibold text-terracotta">
                        Admin
                      </span>
                    )}
                    {!u.isActive && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                        Deactivated
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-espresso/50">{u.email}</p>
                </div>

                <ChevronRight size={16} className="text-espresso/30" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="w-80 shrink-0"
          >
            <div className="sticky top-6 rounded-3xl border border-sand bg-white shadow-warm-lg overflow-hidden">
              {/* Header */}
              <div className="bg-warm-gradient px-5 py-4 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {selected.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selected.image}
                        alt=""
                        className="h-12 w-12 rounded-full border-2 border-white/40 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-lg font-bold">
                        {selected.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold leading-tight">{selected.name}</p>
                      <p className="text-xs text-white/70 capitalize">{selected.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full p-1 hover:bg-white/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
                {detailLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="skeleton h-8 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Contact info */}
                    <section className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-espresso/40">
                        Contact
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-espresso/70">
                          <Mail size={13} className="shrink-0 text-terracotta/60" />
                          <span className="break-all">{selected.email}</span>
                        </div>
                        {selected.phone && (
                          <div className="flex items-center gap-2 text-espresso/70">
                            <Phone size={13} className="shrink-0 text-terracotta/60" />
                            <span>{selected.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-espresso/70">
                          <Calendar size={13} className="shrink-0 text-terracotta/60" />
                          <span>Joined {formatDate(selected.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-espresso/70">
                          <ShoppingBag size={13} className="shrink-0 text-terracotta/60" />
                          <span>{selected.orderCount ?? 0} order{selected.orderCount !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </section>

                    {/* Saved addresses */}
                    <section className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-espresso/40">
                        Saved addresses ({selected.addresses?.length ?? 0})
                      </p>
                      {!selected.addresses?.length ? (
                        <p className="text-xs text-espresso/40">No addresses saved.</p>
                      ) : (
                        <div className="space-y-2">
                          {selected.addresses.map((a: any) => (
                            <div
                              key={a._id}
                              className={cn(
                                "rounded-xl border p-3 text-sm",
                                a.isDefault
                                  ? "border-terracotta/30 bg-terracotta/5"
                                  : "border-sand bg-sand/30"
                              )}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <p className="flex items-center gap-1 font-medium text-espresso">
                                  <Home size={11} className="text-terracotta" />
                                  {a.label}
                                  {a.isDefault && (
                                    <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[9px] font-bold text-white">
                                      DEFAULT
                                    </span>
                                  )}
                                </p>
                                {a.lat && a.lng && (
                                  <a
                                    href={`https://www.google.com/maps?q=${a.lat},${a.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-0.5 text-[11px] text-terracotta hover:underline"
                                  >
                                    <Map size={10} /> Map
                                  </a>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-espresso/70">
                                {a.fullName} · {a.phone}
                              </p>
                              <p className="text-xs text-espresso/50">
                                {a.line1}{a.line2 ? `, ${a.line2}` : ""},{" "}
                                {a.city}, {a.state} – {a.pincode}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Recent orders */}
                    {selected.recentOrders?.length > 0 && (
                      <section className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-espresso/40">
                          Recent orders
                        </p>
                        <div className="space-y-1.5">
                          {selected.recentOrders.map((o: any) => (
                            <Link
                              key={o._id}
                              href={`/admin/orders/${o._id}`}
                              className="flex items-center justify-between rounded-xl border border-sand bg-sand/30 px-3 py-2 text-xs hover:bg-sand/60 transition"
                            >
                              <div>
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 font-semibold capitalize",
                                    STATUS_COLOR[o.status] ?? "bg-sand text-espresso/60"
                                  )}
                                >
                                  {STATUS_LABEL[o.status] ?? o.status}
                                </span>
                                <span className="ml-2 text-espresso/40">
                                  {formatDate(o.createdAt)}
                                </span>
                              </div>
                              {o.adminPrice && (
                                <span className="font-semibold text-espresso">
                                  ₹{o.adminPrice.toLocaleString()}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={`/admin/orders?user=${selected._id}`}
                          className="block text-center text-xs font-medium text-terracotta hover:underline"
                        >
                          View all orders →
                        </Link>
                      </section>
                    )}

                    {/* Actions */}
                    <section className="space-y-2 border-t border-sand pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-espresso/40">
                        Actions
                      </p>
                      <div className="flex flex-col gap-2">
                        {selected.role === "admin" ? (
                          <button
                            onClick={() => update(selected._id, { role: "customer" }, "Demoted to customer")}
                            disabled={busyId === selected._id}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-sand px-3 py-2 text-sm font-medium hover:bg-sand/80 disabled:opacity-40"
                          >
                            <ShieldOff size={14} /> Remove admin
                          </button>
                        ) : (
                          <button
                            onClick={() => update(selected._id, { role: "admin" }, "Promoted to admin")}
                            disabled={busyId === selected._id}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-sand px-3 py-2 text-sm font-medium hover:bg-sand/80 disabled:opacity-40"
                          >
                            <Shield size={14} /> Make admin
                          </button>
                        )}

                        {selected.isActive ? (
                          <button
                            onClick={() => update(selected._id, { isActive: false }, "User deactivated")}
                            disabled={busyId === selected._id}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 disabled:opacity-40"
                          >
                            <UserX size={14} /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => update(selected._id, { isActive: true }, "User reactivated")}
                            disabled={busyId === selected._id}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-40"
                          >
                            <UserCheck size={14} /> Reactivate
                          </button>
                        )}
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
