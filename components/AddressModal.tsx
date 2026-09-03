"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  MapPin,
  Check,
  Home,
  Trash2,
  Plus,
  Map,
  Pencil,
} from "lucide-react";
import { useAddresses, type Address } from "@/components/AddressContext";
import { GoogleMapPicker, type MapLocation } from "@/components/GoogleMapPicker";
import { cn } from "@/lib/utils";

const EMPTY = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  isDefault: false,
};

type FormMode = "list" | "map" | "form";

export function AddressModal() {
  const { addresses, modalOpen, closeModal, refresh } = useAddresses();
  const [mode, setMode] = useState<FormMode>("list");
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleMapSelect = (loc: MapLocation) => {
    setForm((f) => ({
      ...f,
      line1: loc.line1 || f.line1,
      line2: loc.line2 || f.line2,
      city: loc.city || f.city,
      state: loc.state || f.state,
      pincode: loc.pincode || f.pincode,
      lat: loc.lat,
      lng: loc.lng,
    }));
  };

  const save = async () => {
    const required = ["fullName", "phone", "line1", "city", "state", "pincode"];
    for (const k of required) {
      if (!form[k as keyof typeof form]) {
        toast.error(`Please fill in: ${k}`);
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not save address");
        return;
      }
      toast.success("Address saved");
      await refresh();
      setForm({ ...EMPTY });
      setMode("list");
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/user/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setDefault: true }),
    });
    await refresh();
    toast.success("Default delivery address updated");
  };

  const remove = async (id: string) => {
    await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    await refresh();
    toast.success("Address removed");
  };

  const title =
    mode === "list" ? "Delivery address" : "Add new address";

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-warm-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <MapPin className="text-terracotta" size={20} />
                {title}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 hover:bg-sand"
              >
                <X size={20} />
              </button>
            </div>

            {/* ── LIST VIEW ── */}
            {mode === "list" && (
              <div className="mt-5 space-y-3">
                {addresses.length === 0 && (
                  <p className="rounded-2xl bg-sand/50 p-4 text-sm text-espresso/60">
                    No saved addresses yet. Add one to speed up checkout.
                  </p>
                )}
                {addresses.map((a: Address) => (
                  <div
                    key={a._id}
                    className={cn(
                      "rounded-2xl border p-4 transition",
                      a.isDefault
                        ? "border-terracotta bg-terracotta/5"
                        : "border-sand bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold">
                          <Home size={14} className="text-terracotta" />
                          {a.label}
                          {a.isDefault && (
                            <span className="rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-bold text-white">
                              DEFAULT
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-sm text-espresso/80">
                          {a.fullName} · {a.phone}
                        </p>
                        <p className="text-sm text-espresso/60">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city},{" "}
                          {a.state} - {a.pincode}
                        </p>
                        {a.lat && a.lng && (
                          <a
                            href={`https://www.google.com/maps?q=${a.lat},${a.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-terracotta hover:underline"
                          >
                            <Map size={11} /> View on map
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => remove(a._id)}
                        className="shrink-0 rounded-lg p-1.5 text-espresso/40 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {!a.isDefault && (
                      <button
                        onClick={() => setDefault(a._id)}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-terracotta hover:underline"
                      >
                        <Check size={13} /> Deliver here
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => {
                    setForm({ ...EMPTY });
                    setMode("map");
                  }}
                  className="btn-primary w-full"
                >
                  <Plus size={16} /> Add a new address
                </button>
              </div>
            )}

            {/* ── ADD ADDRESS VIEW (map + form combined) ── */}
            {(mode === "map" || mode === "form") && (
              <div className="mt-5 space-y-4">

                {/* Map section — collapsible */}
                {mode === "map" ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-espresso/40">
                        Pin on map (optional)
                      </p>
                      <button
                        onClick={() => setMode("form")}
                        className="flex items-center gap-1 text-xs text-espresso/50 hover:text-espresso"
                      >
                        Hide map
                      </button>
                    </div>
                    <GoogleMapPicker
                      initial={{ lat: form.lat, lng: form.lng }}
                      onSelect={handleMapSelect}
                    />
                    {form.lat && form.lng && (
                      <p className="flex items-center gap-1 text-xs text-terracotta">
                        <MapPin size={11} /> Location pinned — form fields updated below
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setMode("map")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-terracotta/40 bg-terracotta/5 py-2.5 text-sm font-medium text-terracotta transition hover:bg-terracotta/10"
                  >
                    <Map size={15} /> Pick location on Google Maps
                  </button>
                )}

                {/* Full editable form — always visible */}
                <div className="rounded-2xl border border-sand bg-white p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-espresso/40 flex items-center gap-1">
                    <Pencil size={11} /> Address details
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      placeholder="Full name *"
                      className="input-field"
                    />
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="Phone *"
                      className="input-field"
                    />
                  </div>

                  <input
                    value={form.line1}
                    onChange={(e) => set("line1", e.target.value)}
                    placeholder="House no., building, street *"
                    className="input-field"
                  />
                  <input
                    value={form.line2}
                    onChange={(e) => set("line2", e.target.value)}
                    placeholder="Area, landmark (optional)"
                    className="input-field"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="City *"
                      className="input-field"
                    />
                    <input
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      placeholder="State *"
                      className="input-field"
                    />
                    <input
                      value={form.pincode}
                      onChange={(e) => set("pincode", e.target.value)}
                      placeholder="PIN *"
                      className="input-field"
                    />
                  </div>

                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map((l) => (
                      <button
                        key={l}
                        onClick={() => set("label", l)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium transition",
                          form.label === l
                            ? "bg-terracotta text-white"
                            : "bg-sand text-espresso/70"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-espresso/70">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => set("isDefault", e.target.checked)}
                      className="accent-terracotta"
                    />
                    Set as default delivery address
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setForm({ ...EMPTY }); setMode("list"); }}
                    className="btn-ghost flex-1 !py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="btn-primary flex-1 !py-2.5"
                  >
                    {saving ? "Saving…" : "Save address"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
