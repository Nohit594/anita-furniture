"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { useAddresses } from "@/components/AddressContext";
import {
  MapPin,
  Plus,
  Home,
  Package,
  Receipt,
  ShieldCheck,
  Pencil,
  Check,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const { data: session, update } = useSession();
  const { addresses, openModal } = useAddresses();
  const isAdmin = session?.user?.role === "admin";

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveName = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save name");
      await update({ name: data.name });
      setEditingName(false);
      toast.success("Name updated");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSavingName(false);
    }
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8MB)");
      return;
    }
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok || !upData.url) throw new Error(upData.error || "Upload failed");

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: upData.url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save avatar");
      await update({ image: data.image });
      toast.success("Profile photo updated");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold">My Profile</h1>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-5 rounded-3xl border border-sand bg-white p-6 shadow-sm"
        >
          {/* Avatar with upload */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="group relative block h-20 w-20 overflow-hidden rounded-full ring-4 ring-sand"
              aria-label="Change profile photo"
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-warm-gradient text-2xl font-bold text-white">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-espresso/50 text-white opacity-0 transition group-hover:opacity-100">
                {uploadingAvatar ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickAvatar}
              className="hidden"
            />
          </div>

          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  maxLength={60}
                  className="w-full max-w-xs rounded-xl border border-sand bg-cream/40 px-3 py-2 font-display text-xl font-bold outline-none focus:border-terracotta focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") {
                      setName(session?.user?.name || "");
                      setEditingName(false);
                    }
                  }}
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-white transition hover:bg-terracotta-dark disabled:opacity-60"
                  aria-label="Save name"
                >
                  {savingName ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setName(session?.user?.name || "");
                    setEditingName(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-sand text-espresso/60 transition hover:bg-sand"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-display text-2xl font-bold">
                  {session?.user?.name}
                </p>
                <button
                  onClick={() => {
                    setName(session?.user?.name || "");
                    setEditingName(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-espresso/50 transition hover:bg-sand hover:text-terracotta"
                  aria-label="Edit name"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}
            <p className="truncate text-espresso/60">{session?.user?.email}</p>
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                isAdmin
                  ? "bg-terracotta/10 text-terracotta"
                  : "bg-sand text-espresso/70"
              )}
            >
              {isAdmin ? <ShieldCheck size={13} /> : <Home size={13} />}
              {isAdmin ? "Administrator" : "Customer"}
            </span>
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/orders"
            className="card flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-warm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <Package size={20} />
            </span>
            <div>
              <p className="font-semibold">My Orders</p>
              <p className="text-sm text-espresso/60">Track & manage orders</p>
            </div>
          </Link>
          <Link
            href="/payments"
            className="card flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-warm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <Receipt size={20} />
            </span>
            <div>
              <p className="font-semibold">Payment History</p>
              <p className="text-sm text-espresso/60">View your transactions</p>
            </div>
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="card flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-warm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="font-semibold">Admin Panel</p>
                <p className="text-sm text-espresso/60">Manage the store</p>
              </div>
            </Link>
          )}
        </div>

        {/* Addresses */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Saved Addresses</h2>
          <button onClick={openModal} className="btn-primary !py-2 text-sm">
            <Plus size={16} /> Add address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-3xl border border-dashed border-sand py-14 text-center">
            <MapPin className="text-terracotta/40" size={44} />
            <p className="mt-3 font-medium">No addresses saved</p>
            <p className="text-sm text-espresso/60">
              Add a delivery address for faster checkout.
            </p>
            <button onClick={openModal} className="btn-ghost mt-4">
              <Plus size={16} /> Add your first address
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <div
                key={a._id}
                className={cn(
                  "rounded-2xl border p-5",
                  a.isDefault
                    ? "border-terracotta bg-terracotta/5"
                    : "border-sand bg-white"
                )}
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Home size={15} className="text-terracotta" />
                  {a.label}
                  {a.isDefault && (
                    <span className="rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-bold text-white">
                      DEFAULT
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-espresso/80">
                  {a.fullName} · {a.phone}
                </p>
                <p className="text-sm text-espresso/60">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} -{" "}
                  {a.pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
