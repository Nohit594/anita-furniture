import { ADMIN_STATUS_META } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function AdminStatusBadge({ status }: { status: string }) {
  const meta = ADMIN_STATUS_META[status] ?? {
    label: status,
    color: "bg-gray-100 text-gray-700 border-gray-300",
  };
  const isPaid = status === "paid";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
        meta.color
      )}
    >
      {isPaid && <CheckCircle2 size={12} />}
      {meta.label}
    </span>
  );
}
