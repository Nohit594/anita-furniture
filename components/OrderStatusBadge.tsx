import { STATUS_META } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    color: "bg-gray-100 text-gray-700 border-gray-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        meta.color
      )}
    >
      {meta.label}
    </span>
  );
}
