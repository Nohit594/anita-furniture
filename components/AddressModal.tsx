"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  LocateFixed,
  Loader2,
  MapPin,
  Check,
  Home,
  Trash2,
  Plus,
} from "lucide-react";
import { useAddresses, type Address } from "@/components/AddressContext";
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

export function AddressModal() {
  const { addresses, modalOpen, closeModal, refresh } = useAddresses();
  const [mode, setMode] = useState<"list" | "form">("list");
  const [form, setForm] = useState({ ...EMPTY });
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Uses browser geolocation + free OpenStreetMap Nominatim reverse geocoding
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const a = data.address || {};
          setForm((f) => ({
            ...f,
            line1:
              f.line1 ||
              [a.house_number, a.road, a.neighbourhood]
                .filter(Boolean)
                .join(", "),
            line2: f.line2 || a.suburb || "",
            city: a.city || a.town || a.village || a.county || f.city,
            state: a.state || f.state,
            pincode: a.postcode || f.pincode,
            lat: latitude,
            lng: longitude,
          }));
          toast.success("Location detected — review and complete the form");
        } catch {
          setForm((f) => ({ ...f, lat: latitude, lng: longitude }));
          toast.message("Got coordinates. Please fill the address manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Couldn't get your location. Enable location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const save = async () => {
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
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-warm-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <MapPin className="text-terracotta" size={20} />
                {mode === "list" ? "Delivery address" : "Add a new address"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 hover:bg-sand"
              >
                <X size={20} />
              </button>
            </div>

            {mode === "list" ? (
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
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} -{" "}
                          {a.pincode}
                        </p>
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
                  onClick={() => setMode("form")}
                  className="btn-ghost w-full"
                >
                  <Plus size={16} /> Add a new address
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <button
                  onClick={detectLocation}
                  disabled={locating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-terracotta/40 bg-terracotta/5 py-3 text-sm font-medium text-terracotta-dark transition hover:bg-terracotta/10"
                >
                  {locating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LocateFixed size={16} />
                  )}
                  {locating ? "Detecting…" : "Use my current location"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Full name"
                    className="input-field"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="Phone"
                    className="input-field"
                  />
                </div>
                <input
                  value={form.line1}
                  onChange={(e) => set("line1", e.target.value)}
                  placeholder="House no., building, street"
                  className="input-field"
                />
                <input
                  value={form.line2}
                  onChange={(e) => set("line2", e.target.value)}
                  placeholder="Area, landmark (optional)"
                  className="input-field"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="City"
                    className="input-field"
                  />
                  <input
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="State"
                    className="input-field"
                  />
                  <input
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                    placeholder="PIN"
                    className="input-field"
                  />
                </div>

                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((l) => (
                    <button
                      key={l}
                      onClick={() => set("label", l)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-medium transition",
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

                {form.lat && (
                  <a
                    href={`https://www.google.com/maps?q=${form.lat},${form.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline"
                  >
                    <MapPin size={12} /> View pinned location on map
                  </a>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setMode("list")}
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
