"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, HandCoins, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRazorpayCheckout } from "@/components/useRazorpayCheckout";

interface Props {
  order: any;
  userName?: string | null;
  userEmail?: string | null;
  onUpdate: () => void;
}

export function PriceNegotiation({ order, userName, userEmail, onUpdate }: Props) {
  const { pay } = useRazorpayCheckout();
  const [counter, setCounter] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [busy, setBusy] = useState(false);

  const patch = async (body: any) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Action failed");
        return false;
      }
      onUpdate();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const accept = async () => {
    const ok = await patch({ action: "accept_price" });
    if (ok) toast.success("Price accepted — proceed to payment.");
  };

  const sendCounter = async () => {
    const val = Number(counter);
    if (!val || val <= 0) return toast.error("Enter a valid amount");
    const ok = await patch({ action: "counter", price: val });
    if (ok) {
      toast.success("Counter-offer sent to the admin.");
      setShowCounter(false);
      setCounter("");
    }
  };

  const startPayment = () => {
    pay({
      orderId: order._id,
      userName,
      userEmail,
      onSuccess: onUpdate,
    });
  };

  // ── Price is set → customer can accept or counter ──
  if (order.status === "price_set") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-terracotta/30 bg-terracotta/5 p-6"
      >
        <p className="text-sm font-medium text-espresso/60">Admin&apos;s price</p>
        <p className="font-display text-4xl font-bold text-terracotta">
          {formatCurrency(order.adminPrice)}
        </p>
        {order.customerCounterPrice && (
          <p className="mt-1 text-sm text-espresso/60">
            (Your last counter: {formatCurrency(order.customerCounterPrice)})
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={accept} disabled={busy} className="btn-primary !py-2.5">
            <Check size={18} /> Accept & pay
          </button>
          <button
            onClick={() => setShowCounter((s) => !s)}
            disabled={busy}
            className="btn-ghost !py-2.5"
          >
            <HandCoins size={18} /> Counter-offer
          </button>
        </div>

        {showCounter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/50">
                ₹
              </span>
              <input
                type="number"
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                placeholder="Your price"
                className="input-field !w-44 pl-7"
              />
            </div>
            <button onClick={sendCounter} disabled={busy} className="btn-primary !py-2.5">
              Send counter
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ── Countered → waiting on admin ──
  if (order.status === "customer_countered") {
    return (
      <div className="rounded-3xl border border-purple-200 bg-purple-50 p-6">
        <p className="font-medium text-purple-800">
          Your counter-offer of {formatCurrency(order.customerCounterPrice)} is
          with the admin.
        </p>
        <p className="mt-1 text-sm text-purple-700/80">
          We&apos;ll notify you when they respond with a final price.
        </p>
      </div>
    );
  }

  // ── Accepted → pay now ──
  if (order.status === "customer_accepted") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border-2 border-green-300 bg-green-50 p-6"
      >
        <p className="text-sm font-medium text-green-700">Amount due</p>
        <p className="font-display text-4xl font-bold text-green-700">
          {formatCurrency(order.finalPrice ?? order.adminPrice)}
        </p>
        <button onClick={startPayment} disabled={busy} className="btn-primary mt-5 !py-2.5">
          <CreditCard size={18} /> Pay now
        </button>
      </motion.div>
    );
  }

  return null;
}
