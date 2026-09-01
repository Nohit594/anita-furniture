"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

interface PaymentRow {
  _id: string;
  amount: number;
  currency: string;
  status: "success" | "failed";
  method?: string;
  reason?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => setPayments(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div>
          <h1 className="font-display text-4xl font-bold">Payment History</h1>
          <p className="mt-2 text-espresso/70">
            All your transactions — successful and failed.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-24 rounded-3xl" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-sand py-20 text-center">
            <Receipt className="text-terracotta/40" size={56} />
            <p className="mt-4 text-lg font-medium">No transactions yet</p>
            <p className="text-espresso/60">
              Your payments will show up here once you check out.
            </p>
            <Link href="/orders" className="btn-primary mt-6">
              Go to my orders
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {payments.map((p, i) => {
              const success = p.status === "success";
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-3xl border border-sand bg-white p-5"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      success
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {success ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <XCircle size={24} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          success
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {success ? "Success" : "Failed"}
                      </span>
                      <span className="text-xs text-espresso/50">
                        {formatDate(p.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 font-medium text-espresso">
                      {txnTitle(p)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso/50">
                      <CreditCard size={12} />
                      {p.razorpayPaymentId || p.razorpayOrderId || "—"}
                      {!success && p.reason ? ` · ${p.reason}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <p
                      className={`font-display text-lg font-bold ${
                        success ? "text-espresso" : "text-espresso/50 line-through"
                      }`}
                    >
                      {formatCurrency(p.amount)}
                    </p>
                    {p.orderId?._id && (
                      <Link
                        href={`/orders/${p.orderId._id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-terracotta hover:underline"
                      >
                        View order <ArrowUpRight size={12} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
