"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Receipt,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentRow {
  _id: string;
  amount: number;
  status: "success" | "failed";
  method?: string;
  reason?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
  userId?: { _id: string; name?: string; email?: string } | null;
  orderId?: {
    _id: string;
    type: string;
    description?: string;
    catalogueItemId?: { name?: string };
  } | null;
}

function txnTitle(p: PaymentRow) {
  const o = p.orderId;
  if (!o) return "Order payment";
  if (o.type === "catalogue")
    return o.catalogueItemId?.name || o.description || "Catalogue order";
  return o.description || "Custom order";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => setPayments(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const visible = payments.filter(
    (p) => filter === "all" || p.status === filter
  );

  const totalSuccess = payments
    .filter((p) => p.status === "success")
    .reduce((s, p) => s + (p.amount ?? 0), 0);
  const countSuccess = payments.filter((p) => p.status === "success").length;
  const countFailed = payments.filter((p) => p.status === "failed").length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Payments</h1>
      <p className="mt-1 text-espresso/60">
        All customer transactions — confirmed and failed.
      </p>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-sand bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
            Total received
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
            {formatCurrency(totalSuccess)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso/50">
            <TrendingUp size={11} /> {countSuccess} successful txns
          </p>
        </div>
        <div className="rounded-2xl border border-sand bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
            Confirmed
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
            {countSuccess}
          </p>
          <p className="mt-0.5 text-xs text-espresso/50">payments</p>
        </div>
        <div className="rounded-2xl border border-sand bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
            Failed
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-red-600">
            {countFailed}
          </p>
          <p className="mt-0.5 text-xs text-espresso/50">attempts</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {(["all", "success", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all",
              filter === f
                ? "bg-terracotta text-white shadow-warm"
                : "bg-sand text-espresso/70 hover:bg-peach/30"
            )}
          >
            {f === "all" ? "All" : f === "success" ? "Confirmed" : "Failed"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-sand py-16 text-center">
          <Receipt className="text-terracotta/40" size={48} />
          <p className="mt-3 font-medium">No transactions yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((p, i) => {
            const success = p.status === "success";
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-2xl border border-sand bg-white p-4"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    success
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-500"
                  )}
                >
                  {success ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <XCircle size={22} />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        success
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-600"
                      )}
                    >
                      {success ? "Payment Confirmed" : "Failed"}
                    </span>
                    {p.method && (
                      <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-espresso/60 capitalize">
                        {p.method}
                      </span>
                    )}
                    <span className="text-xs text-espresso/40">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 text-sm font-medium text-espresso">
                    {p.userId?.name || "Customer"} — {txnTitle(p)}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso/50">
                    <CreditCard size={11} />
                    {p.razorpayPaymentId || p.razorpayOrderId || "—"}
                    {!success && p.reason
                      ? <span className="text-red-500"> · {p.reason}</span>
                      : null}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <p
                    className={cn(
                      "font-display text-lg font-bold",
                      success ? "text-emerald-700" : "text-espresso/40 line-through"
                    )}
                  >
                    {formatCurrency(p.amount)}
                  </p>
                  {p.orderId?._id && (
                    <Link
                      href={`/admin/orders/${p.orderId._id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-terracotta hover:underline"
                    >
                      View order <ArrowUpRight size={11} />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
