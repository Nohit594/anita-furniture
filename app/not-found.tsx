import Link from "next/link";
import { Sofa } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-gradient text-white shadow-warm">
        <Sofa size={32} />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold">404</h1>
      <p className="mt-2 text-espresso/70">
        This page seems to have been moved to another room.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
