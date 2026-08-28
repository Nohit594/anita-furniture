"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PriceNegotiation } from "@/components/PriceNegotiation";
import { formatCurrency, formatDate, STATUS_META } from "@/lib/utils";
import { ArrowLeft, ImageOff, Info } from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  const load = useCallback(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d?.error ? null : d))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-lg font-medium">Order not found</p>
        <Link href="/orders" className="btn-ghost mt-4">
          Back to orders
        </Link>
      </div>
    );
  }

  const images: string[] = order.images ?? [];
  const meta = STATUS_META[order.status];

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-1 text-sm text-espresso/60 hover:text-terracotta"
        >
          <ArrowLeft size={16} /> Back to orders
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-sand bg-sand">
              {images[active] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[active]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-espresso/30">
                  <ImageOff size={48} />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
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

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium capitalize">
                {order.type} order
              </span>
              <OrderStatusBadge status={order.status} />
            </div>

            <h1 className="mt-4 font-display text-2xl font-bold">
              {order.type === "catalogue"
                ? order.catalogueItemId?.name || "Catalogue order"
                : "Custom request"}
            </h1>
            <p className="mt-1 text-sm text-espresso/50">
              Placed {formatDate(order.createdAt)}
            </p>

            {order.description && (
              <div className="mt-4 rounded-2xl bg-sand/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-espresso/80">
                  {order.description}
                </p>
              </div>
            )}

            {meta && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-sand bg-white p-4 text-sm text-espresso/70">
                <Info size={16} className="mt-0.5 shrink-0 text-terracotta" />
                {meta.description}
              </div>
            )}

            {order.adminNotes && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
                <p className="font-semibold text-amber-800">Note from Anita Furniture</p>
                <p className="mt-1 text-amber-700/90">{order.adminNotes}</p>
              </div>
            )}

            {/* Negotiation / payment actions */}
            <div className="mt-6">
              <PriceNegotiation
                order={order}
                userName={session?.user?.name}
                userEmail={session?.user?.email}
                onUpdate={load}
              />
            </div>

            {order.status === "paid" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center"
              >
                <p className="font-display text-xl font-bold text-emerald-700">
                  Payment complete 🎉
                </p>
                <p className="mt-1 text-sm text-emerald-700/80">
                  Paid {formatCurrency(order.finalPrice ?? order.adminPrice)}. We&apos;ll
                  start crafting your order.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
