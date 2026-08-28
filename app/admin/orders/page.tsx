"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ImageOff, Search, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "price_set", label: "Priced" },
  { value: "customer_countered", label: "Countered" },
  { value: "customer_accepted", label: "Accepted" },
  { value: "paid", label: "Paid" },
  { value: "in_production", label: "In Production" },
  { value: "completed", label: "Completed" },
];

function AdminOrdersInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("status") || "all";
  const [filter, setFilter] = useState(initial);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = filter === "all" ? "" : `?status=${filter}`;
    fetch(`/api/orders${q}`)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [filter]);

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not delete order");
        return;
      }
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast.success("Order deleted");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <p className="mt-1 text-espresso/60">
        Review requests, set prices, respond to counter-offers.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              filter === f.value
                ? "bg-terracotta text-white shadow-warm"
                : "bg-sand text-espresso/70 hover:bg-peach/30"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-sand py-16 text-center">
          <Search className="text-terracotta/40" size={48} />
          <p className="mt-3 font-medium">No orders in this view</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex items-center gap-2 rounded-2xl border border-sand bg-white p-3 transition-all hover:border-terracotta/40 hover:shadow-warm"
            >
              <Link
                href={`/admin/orders/${order._id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {order.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-espresso/30">
                      <ImageOff size={20} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium capitalize">
                      {order.type}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm font-medium">
                    {order.userId?.name || "Customer"} —{" "}
                    {order.description || "Custom request"}
                  </p>
                  <p className="text-xs text-espresso/50">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {order.customerCounterPrice &&
                    order.status === "customer_countered" && (
                      <p className="text-xs text-purple-600">
                        Counter: {formatCurrency(order.customerCounterPrice)}
                      </p>
                    )}
                  {(order.finalPrice ?? order.adminPrice) != null && (
                    <p className="font-semibold text-terracotta">
                      {formatCurrency(order.finalPrice ?? order.adminPrice)}
                    </p>
                  )}
                </div>
              </Link>

              {/* Delete control */}
              {confirmId === order._id ? (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => remove(order._id)}
                    disabled={deletingId === order._id}
                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {deletingId === order._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    disabled={deletingId === order._id}
                    className="rounded-lg border border-sand px-3 py-2 text-xs font-medium text-espresso/60 transition hover:bg-sand"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(order._id)}
                  title="Delete order"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-espresso/40 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 rounded-3xl" />}>
      <AdminOrdersInner />
    </Suspense>
  );
}
