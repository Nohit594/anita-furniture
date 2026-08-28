"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ImageOff, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useRazorpayCheckout } from "@/components/useRazorpayCheckout";
import { MockPaymentModal } from "@/components/MockPaymentModal";

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export function CatalogueDetail({ item }: { item: Item }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { pay, mock, closeMock } = useRazorpayCheckout();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!session) {
      signIn("google");
      return;
    }
    setLoading(true);
    try {
      // Create a catalogue order (auto-priced, ready to pay)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "catalogue",
          catalogueItemId: item._id,
          description: item.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not create order");
        return;
      }
      await pay({
        orderId: data._id,
        userName: session.user?.name,
        userEmail: session.user?.email,
        onSuccess: () => router.push(`/orders/${data._id}`),
      });
    } finally {
      setLoading(false);
    }
  };

  const images = item.images?.length ? item.images : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/catalogue"
        className="mb-6 inline-flex items-center gap-1 text-sm text-espresso/60 hover:text-terracotta"
      >
        <ArrowLeft size={16} /> Back to catalogue
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border border-sand bg-sand">
            {images[active] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[active]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-espresso/30">
                <ImageOff size={56} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                    active === i ? "border-terracotta" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-terracotta-dark">
            {item.category}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold">{item.name}</h1>
          <p className="mt-4 text-4xl font-bold text-terracotta">
            {formatCurrency(item.price)}
          </p>
          <p className="mt-6 leading-relaxed text-espresso/75">
            {item.description || "A beautifully crafted piece for your home."}
          </p>

          <button
            onClick={handleOrder}
            disabled={loading}
            className="btn-primary mt-8 w-full sm:w-auto"
          >
            <ShoppingBag size={18} />
            {loading ? "Processing..." : session ? "Order & Pay" : "Sign in to order"}
          </button>

          <div className="mt-8 rounded-2xl bg-sand/50 p-5 text-sm text-espresso/70">
            <p className="font-semibold text-espresso">Want it customized?</p>
            <p className="mt-1">
              Start a{" "}
              <Link href="/custom-order" className="text-terracotta underline">
                custom order
              </Link>{" "}
              to tweak dimensions, materials, or finish.
            </p>
          </div>
        </motion.div>
      </div>

      {mock && (
        <MockPaymentModal
          open={mock.open}
          amount={mock.amount}
          orderId={mock.orderId}
          razorpayOrderId={mock.razorpayOrderId}
          onSuccess={mock.onSuccess}
          onClose={closeMock}
        />
      )}
    </div>
  );
}
