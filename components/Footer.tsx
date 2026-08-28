import Link from "next/link";
import { Sofa, Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-sand bg-sand/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-gradient text-white">
              <Sofa size={20} />
            </span>
            <span className="font-display text-lg font-bold">
              Anita <span className="text-terracotta">Furniture</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-espresso/70">
            Handcrafted furniture, made your way. Custom designs and curated
            collections.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-espresso/70">
            <li>
              <Link href="/catalogue" className="hover:text-terracotta">
                Catalogue
              </Link>
            </li>
            <li>
              <Link href="/custom-order" className="hover:text-terracotta">
                Custom Order
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-terracotta">
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-espresso/70">
            <li className="flex items-center gap-2">
              <Mail size={14} /> hello@anitafurniture.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Instagram size={14} /> @anitafurniture
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Made with care</h4>
          <p className="text-sm text-espresso/70">
            Describe your dream piece in Hindi, English, or any language — we
            bring it to life.
          </p>
        </div>
      </div>
      <div className="border-t border-sand py-4 text-center text-xs text-espresso/50">
        © {new Date().getFullYear()} Anita Furniture. All rights reserved.
      </div>
    </footer>
  );
}
