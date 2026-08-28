"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutArgs {
  orderId: string;
  userName?: string | null;
  userEmail?: string | null;
  onSuccess?: () => void;
}

interface MockState {
  open: boolean;
  amount: number;
  orderId: string;
  razorpayOrderId: string;
  onSuccess: () => void;
}

const MOCK = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === "true";

export function useRazorpayCheckout() {
  const [mock, setMock] = useState<MockState | null>(null);

  const pay = useCallback(async (args: CheckoutArgs) => {
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: args.orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not start payment");
        return;
      }

      // ── Mock mode ──
      if (data.mock || MOCK) {
        setMock({
          open: true,
          amount: data.amount,
          orderId: args.orderId,
          razorpayOrderId: data.razorpayOrderId,
          onSuccess: args.onSuccess ?? (() => {}),
        });
        return;
      }

      // ── Real Razorpay ──
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) {
        toast.error("Failed to load payment gateway. Check your connection.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Anita Furniture",
        description: "Furniture order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          name: args.userName || "",
          email: args.userEmail || "",
        },
        theme: { color: "#C4622D" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: args.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            toast.success("Payment successful! Your order is confirmed 🎉");
            args.onSuccess?.();
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed. Try again."));
      rzp.open();
    } catch {
      toast.error("Something went wrong starting payment.");
    }
  }, []);

  const closeMock = useCallback(() => setMock(null), []);

  return { pay, mock, closeMock };
}
