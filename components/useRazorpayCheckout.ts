"use client";

import { useCallback } from "react";
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
  orderId: string; // our internal Order _id
  userName?: string | null;
  userEmail?: string | null;
  onSuccess?: () => void;
}

/**
 * Hook returning a `pay` function that:
 * 1. asks our backend to create a Razorpay order for the given internal order
 * 2. opens the Razorpay checkout modal
 * 3. verifies the signature on success
 */
export function useRazorpayCheckout() {
  const pay = useCallback(async (args: CheckoutArgs) => {
    const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!ok) {
      toast.error("Failed to load payment gateway. Check your connection.");
      return;
    }

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

  return { pay };
}
