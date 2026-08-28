"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, ArrowUpRight, ImageOff, Plus } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">My Orders</h1>
            <p className="mt-2 text-espresso/70">
              Track your custom requests and purchases.
            </p>
          </div>
          <Link href="/custom-order" className="btn-primary !py-2">
            <Plus size={16} /> New
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-28 rounded-3xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-sand py-20 text-center">
            <Package className="text-terracotta/40" size={56} />
            <p className="mt-4 text-lg font-medium">No orders yet</p>
            <p className="text-espresso/60">
              Start a custom order or browse the catalogue.
            </p>
            <Link href="/custom-order" className="btn-primary mt-6">
              Create your first order
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/orders/${order._id}`}
                  className="group flex items-center gap-4 rounded-3xl border border-sand bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-terracotta/40 hover:shadow-warm"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sand">
                    {order.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-espresso/30">
                        <ImageOff size={24} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium capitalize text-espresso/70">
                        {order.type}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 font-medium text-espresso">
                      {order.description || "Custom request"}
                    </p>
                    <p className="mt-0.5 text-sm text-espresso/50">
                      {formatDate(order.createdAt)}
                      {order.finalPrice != null &&
                        ` · ${formatCurrency(order.finalPrice)}`}
                      {order.finalPrice == null &&
                        order.adminPrice != null &&
                        ` · ${formatCurrency(order.adminPrice)}`}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="shrink-0 text-terracotta opacity-0 transition-opacity group-hover:opacity-100"
                    size={20}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
