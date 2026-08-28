"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  X,
  IndianRupee,
  ImageOff,
  Mic,
  Package,
  Trash2,
} from "lucide-react";

const PRODUCTION_STEPS = [
  { value: "in_production", label: "Mark In Production" },
  { value: "completed", label: "Mark Completed" },
];

export default function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const load = useCallback(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.error) {
          setOrder(d);
          setPrice(d.adminPrice ? String(d.adminPrice) : "");
          setNotes(d.adminNotes || "");
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (body: any, successMsg: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Action failed");
        return;
      }
      toast.success(successMsg);
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not delete order");
        return;
      }
      toast.success("Order deleted");
      router.push("/admin/orders");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="skeleton h-96 rounded-3xl" />
    );
  if (!order)
    return (
      <div className="py-20 text-center">
        <p>Order not found.</p>
        <Link href="/admin/orders" className="btn-ghost mt-4">
          Back
        </Link>
      </div>
    );

  const images: string[] = order.images ?? [];
  const isCustom = order.type === "custom";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-espresso/60 hover:text-terracotta"
      >
        <ArrowLeft size={16} /> All orders
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: customer submission */}
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

          <div className="mt-4 rounded-2xl border border-sand bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
              Customer
            </p>
            <div className="mt-1 flex items-center gap-2">
              {order.userId?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.userId.image}
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
              )}
              <span className="font-medium">{order.userId?.name}</span>
              <span className="text-sm text-espresso/50">
                {order.userId?.email}
              </span>
            </div>
          </div>

          {order.description && (
            <div className="mt-4 rounded-2xl border border-sand bg-white p-4">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-espresso/50">
                Description
                {isCustom && order.voiceLanguage && (
                  <span className="ml-1 inline-flex items-center gap-1 text-terracotta">
                    <Mic size={12} /> {order.voiceLanguage}
                  </span>
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-espresso/80">
                {order.description}
              </p>
            </div>
          )}
        </div>

        {/* Right: admin actions */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium capitalize">
              {order.type} order
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-espresso/50">
            Placed {formatDate(order.createdAt)}
          </p>

          {/* Counter alert */}
          {order.status === "customer_countered" && (
            <div className="mt-4 rounded-2xl border-2 border-purple-300 bg-purple-50 p-4">
              <p className="font-semibold text-purple-800">
                Customer counter-offer: {formatCurrency(order.customerCounterPrice)}
              </p>
              <p className="text-sm text-purple-700/80">
                Your last price was {formatCurrency(order.adminPrice)}. Set a new
                final price below.
              </p>
            </div>
          )}

          {/* Custom order approval flow */}
          {isCustom && order.status === "pending" && (
            <div className="mt-6 space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional note to the customer…"
                className="input-field resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => patch({ action: "approve", notes }, "Order approved")}
                  disabled={busy}
                  className="btn-primary !py-2.5"
                >
                  <Check size={18} /> Approve
                </button>
                <button
                  onClick={() => patch({ action: "reject", notes }, "Order rejected")}
                  disabled={busy}
                  className="btn-ghost !py-2.5"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Set / adjust price */}
          {["approved", "price_set", "customer_countered"].includes(
            order.status
          ) && (
            <div className="mt-6 rounded-2xl border border-sand bg-white p-5">
              <p className="font-semibold">
                {order.status === "customer_countered"
                  ? "Respond with final price"
                  : "Set price"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/50"
                  />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Amount"
                    className="input-field !w-48 pl-9"
                  />
                </div>
                <button
                  onClick={() => {
                    const val = Number(price);
                    if (!val || val <= 0) return toast.error("Enter a valid price");
                    patch(
                      {
                        action:
                          order.status === "customer_countered"
                            ? "respond_counter"
                            : "set_price",
                        price: val,
                        notes,
                      },
                      "Price sent to customer"
                    );
                  }}
                  disabled={busy}
                  className="btn-primary !py-2.5"
                >
                  Send price
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional note…"
                className="input-field mt-3 resize-none"
              />
            </div>
          )}

          {/* Post-payment production controls */}
          {["paid", "in_production", "completed"].includes(order.status) && (
            <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-emerald-700">
                <Package size={18} /> Paid —{" "}
                {formatCurrency(order.finalPrice ?? order.adminPrice)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRODUCTION_STEPS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() =>
                      patch(
                        { action: "set_status", notes: s.value },
                        `Marked ${s.label}`
                      )
                    }
                    disabled={busy || order.status === s.value}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-300 transition hover:bg-emerald-100 disabled:opacity-40"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {order.status === "rejected" && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              This order was rejected.
            </div>
          )}

          {/* Danger zone — delete order */}
          <div className="mt-8 border-t border-sand pt-6">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={16} /> Delete this order
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  Permanently delete this order? This cannot be undone.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={remove}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <Trash2 size={16} /> Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={busy}
                    className="rounded-xl border border-sand bg-white px-4 py-2 text-sm font-medium text-espresso/70 transition hover:bg-sand"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
