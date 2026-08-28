"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ImageUpload";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Pencil, X, ImageOff, Eye, EyeOff } from "lucide-react";

interface Item {
  _id?: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  images: string[];
  isAvailable: boolean;
}

const EMPTY: Item = {
  name: "",
  description: "",
  price: "",
  category: "General",
  images: [],
  isAvailable: true,
};

export default function AdminCataloguePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch("/api/catalogue?all=true")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.price) {
      toast.error("Name and price are required");
      return;
    }
    setBusy(true);
    try {
      const isEdit = !!editing._id;
      const res = await fetch(
        isEdit ? `/api/catalogue/${editing._id}` : "/api/catalogue",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editing, price: Number(editing.price) }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Save failed");
        return;
      }
      toast.success(isEdit ? "Item updated" : "Item added");
      setEditing(null);
      load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/catalogue/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      load();
    } else {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Catalogue</h1>
          <p className="mt-1 text-espresso/60">Manage ready-to-order pieces.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary !py-2">
          <Plus size={16} /> Add item
        </button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-64 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-3xl border border-sand bg-white"
            >
              <div className="relative aspect-[4/3] bg-sand">
                {item.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-espresso/30">
                    <ImageOff size={32} />
                  </div>
                )}
                {!item.isAvailable && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                    Hidden
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-terracotta">
                  {formatCurrency(item.price)}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      setEditing({ ...item, price: String(item.price) })
                    }
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-sand py-2 text-xs font-medium hover:bg-peach/30"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    className="flex items-center justify-center rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-warm-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">
                  {editing._id ? "Edit item" : "Add item"}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-full p-1 hover:bg-sand"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium">Images</label>
                  <div className="mt-2">
                    <ImageUpload
                      images={editing.images}
                      onChange={(imgs) =>
                        setEditing({ ...editing, images: imgs })
                      }
                      min={1}
                      max={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className="input-field mt-1"
                    placeholder="e.g. Teak Wood Coffee Table"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price (₹)</label>
                    <input
                      type="number"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({ ...editing, price: e.target.value })
                      }
                      className="input-field mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <input
                      value={editing.category}
                      onChange={(e) =>
                        setEditing({ ...editing, category: e.target.value })
                      }
                      className="input-field mt-1"
                      placeholder="Tables"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={3}
                    className="input-field mt-1 resize-none"
                    placeholder="Materials, dimensions, finish…"
                  />
                </div>

                <button
                  onClick={() =>
                    setEditing({ ...editing, isAvailable: !editing.isAvailable })
                  }
                  className="flex items-center gap-2 text-sm font-medium text-espresso/70"
                >
                  {editing.isAvailable ? (
                    <>
                      <Eye size={16} className="text-green-600" /> Visible in
                      catalogue
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} className="text-espresso/40" /> Hidden
                    </>
                  )}
                </button>

                <button
                  onClick={save}
                  disabled={busy}
                  className="btn-primary w-full"
                >
                  {busy ? "Saving…" : "Save item"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
