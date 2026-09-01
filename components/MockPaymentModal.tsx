"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, ShieldCheck, Loader2, IndianRupee, Ban } from "lucide-react";
import { toast } from "sonner";

interface MockPaymentModalProps {
  open: boolean;
  amount: number; // in paise
  orderId: string;
  razorpayOrderId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function MockPaymentModal({
  open,
  amount,
  orderId,
  razorpayOrderId,
  onSuccess,
  onClose,
}: MockPaymentModalProps) {
  const [paying, setPaying] = useState(false);
  const [failing, setFailing] = useState(false);

  const simulate = async () => {
    setPaying(true);
    // Brief delay to feel realistic
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const res = await fetch("/api/payment/mock-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, razorpayOrderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Mock payment failed");
      toast.success("Payment successful! Your order is confirmed 🎉");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setPaying(false);
    }
  };

  const simulateFailure = async () => {
    setFailing(true);
    await new Promise((r) => setTimeout(r, 900));
    try {
      await fetch("/api/payment/record-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          razorpayOrderId,
          reason: "Simulated failed payment",
        }),
      });
      toast.error("Payment failed. You can try again.");
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setFailing(false);
    }
  };

  const rupees = (amount / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-warm-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-warm-gradient px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <CreditCard size={20} />
                <span className="font-semibold">Test Payment</span>
              </div>
              <button
                onClick={onClose}
                disabled={paying || failing}
                className="rounded-full p-1 transition hover:bg-white/20"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-sand bg-cream/50 p-4 text-center">
                <p className="text-sm text-espresso/60">Amount to pay</p>
                <p className="mt-1 flex items-center justify-center gap-1 font-display text-3xl font-bold text-espresso">
                  <IndianRupee size={24} />
                  {rupees}
                </p>
                <p className="mt-1 text-xs text-espresso/50">Anita Furniture</p>
              </div>

              {/* Mock card UI */}
              <div className="mt-4 rounded-2xl border border-sand p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-espresso/50">
                  Test card details (pre-filled)
                </p>
                <div className="space-y-2">
                  <input
                    readOnly
                    value="4111 1111 1111 1111"
                    className="w-full rounded-xl border border-sand bg-sand/30 px-4 py-2.5 text-sm text-espresso/60"
                  />
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value="12/29"
                      className="w-1/2 rounded-xl border border-sand bg-sand/30 px-4 py-2.5 text-sm text-espresso/60"
                    />
                    <input
                      readOnly
                      value="123"
                      className="w-1/2 rounded-xl border border-sand bg-sand/30 px-4 py-2.5 text-sm text-espresso/60"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={simulate}
                disabled={paying || failing}
                className="btn-primary mt-4 w-full justify-center disabled:opacity-60"
              >
                {paying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Simulate Payment
                  </>
                )}
              </button>

              <button
                onClick={simulateFailure}
                disabled={paying || failing}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
              >
                {failing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Failing…
                  </>
                ) : (
                  <>
                    <Ban size={16} /> Simulate Failure
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-espresso/40">
                This is a test environment. No real money is charged.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
