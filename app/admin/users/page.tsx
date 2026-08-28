"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Shield, ShieldOff, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = async (userId: string, body: any, msg: string) => {
    setBusyId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success(msg);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Users</h1>
      <p className="mt-1 text-espresso/60">
        Manage roles and account access.
      </p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className={cn(
                "flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition",
                u.isActive ? "border-sand bg-white" : "border-red-200 bg-red-50/50"
              )}
            >
              {u.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.image}
                  alt=""
                  className="h-11 w-11 rounded-full"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand font-semibold text-terracotta">
                  {u.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {u.name}
                  {u.role === "admin" && (
                    <span className="ml-2 rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-semibold text-terracotta">
                      Admin
                    </span>
                  )}
                  {!u.isActive && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                      Deactivated
                    </span>
                  )}
                </p>
                <p className="text-sm text-espresso/50">{u.email}</p>
                <p className="text-xs text-espresso/40">
                  Joined {formatDate(u.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                {u.role === "admin" ? (
                  <button
                    onClick={() =>
                      update(u._id, { role: "customer" }, "Demoted to customer")
                    }
                    disabled={busyId === u._id}
                    className="flex items-center gap-1 rounded-full bg-sand px-3 py-1.5 text-xs font-medium hover:bg-peach/30 disabled:opacity-40"
                  >
                    <ShieldOff size={14} /> Remove admin
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      update(u._id, { role: "admin" }, "Promoted to admin")
                    }
                    disabled={busyId === u._id}
                    className="flex items-center gap-1 rounded-full bg-sand px-3 py-1.5 text-xs font-medium hover:bg-peach/30 disabled:opacity-40"
                  >
                    <Shield size={14} /> Make admin
                  </button>
                )}

                {u.isActive ? (
                  <button
                    onClick={() =>
                      update(u._id, { isActive: false }, "User deactivated")
                    }
                    disabled={busyId === u._id}
                    className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200 disabled:opacity-40"
                  >
                    <UserX size={14} /> Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      update(u._id, { isActive: true }, "User reactivated")
                    }
                    disabled={busyId === u._id}
                    className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-40"
                  >
                    <UserCheck size={14} /> Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
