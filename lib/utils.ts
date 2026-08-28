import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const STATUS_META: Record<
  string,
  { label: string; color: string; description: string }
> = {
  pending: {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Waiting for admin to review your request.",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Approved by admin. Price is being prepared.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-300",
    description: "This request was not approved.",
  },
  price_set: {
    label: "Price Ready",
    color: "bg-terracotta/10 text-terracotta-dark border-terracotta/30",
    description: "Admin has set a price. Accept it or make a counter-offer.",
  },
  customer_accepted: {
    label: "Accepted — Pay Now",
    color: "bg-green-100 text-green-800 border-green-300",
    description: "You accepted the price. Complete payment to confirm.",
  },
  customer_countered: {
    label: "Counter Sent",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    description: "Your counter-offer is with the admin for review.",
  },
  paid: {
    label: "Paid",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Payment received. Your order is confirmed!",
  },
  in_production: {
    label: "In Production",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    description: "Your furniture is being crafted.",
  },
  completed: {
    label: "Completed",
    color: "bg-teal-100 text-teal-800 border-teal-300",
    description: "Order delivered. Thank you!",
  },
};
