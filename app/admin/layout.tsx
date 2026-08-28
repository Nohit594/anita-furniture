import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
