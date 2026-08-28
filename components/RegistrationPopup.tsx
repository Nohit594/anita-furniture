"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "anita_registration_seen";
const INTERESTS = ["Living Room", "Bedroom", "Dining Room"];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  pincode: string;
  interests: string[];
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  city: "",
  pincode: "",
  interests: [],
};

export function RegistrationPopup() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show once per visitor, 7s after load, on the home page only.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    timerRef.current = setTimeout(() => setOpen(true), 7000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (val: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(val)
        ? f.interests.filter((i) => i !== val)
        : [...f.interests, val],
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email";
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, "")))
      e.mobile = "Enter a 10-digit mobile number";
    if (form.pincode && !/^\d{6}$/.test(form.pincode.replace(/\D/g, "")))
      e.pincode = "Enter a 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      toast.success("Welcome to Anita Furniture! We'll be in touch. 🎉");
      dismiss();
    } catch (err: any) {
      toast.error(err.message || "Could not register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Register with Anita Furniture"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-warm-lg md:grid-cols-2"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-espresso shadow-sm transition hover:bg-white"
            >
              <X size={18} />
            </button>

            {/* Left — image */}
            <div className="relative hidden min-h-[320px] md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
                alt="Beautifully furnished living room"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="font-display text-2xl font-bold leading-tight">
                  Furniture made just for you
                </p>
                <p className="mt-1 text-sm text-white/80">
                  Register today for exclusive offers &amp; design tips.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-espresso">
                Join Anita Furniture
              </h2>
              <p className="mt-1 text-sm text-espresso/60">
                Tell us a little about you and we&apos;ll craft the perfect
                space.
              </p>

              <form onSubmit={submit} className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    placeholder="First name*"
                    value={form.firstName}
                    onChange={(v) => update("firstName", v)}
                    error={errors.firstName}
                  />
                  <Field
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(v) => update("lastName", v)}
                  />
                </div>
                <Field
                  type="email"
                  placeholder="Email*"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  error={errors.email}
                />
                <Field
                  type="tel"
                  placeholder="Mobile*"
                  value={form.mobile}
                  onChange={(v) => update("mobile", v)}
                  error={errors.mobile}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    placeholder="City"
                    value={form.city}
                    onChange={(v) => update("city", v)}
                  />
                  <Field
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={(v) => update("pincode", v)}
                    error={errors.pincode}
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso/50">
                    Tell me about
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((i) => {
                      const active = form.interests.includes(i);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => toggleInterest(i)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            active
                              ? "border-terracotta bg-terracotta text-white"
                              : "border-sand bg-white text-espresso/70 hover:border-terracotta/50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full rounded-full bg-red-600 py-3 font-bold uppercase tracking-wide text-white shadow-warm transition hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting ? "Registering…" : "Register Now"}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-cream/40 px-4 py-2.5 text-sm outline-none transition focus:border-terracotta focus:bg-white ${
          error ? "border-red-400" : "border-sand"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
