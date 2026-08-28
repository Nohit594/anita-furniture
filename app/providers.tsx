"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { AddressProvider } from "@/components/AddressContext";
import { AddressModal } from "@/components/AddressModal";
import { ChatWidget } from "@/components/ChatWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AddressProvider>
        {children}
        <AddressModal />
        <ChatWidget />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { borderRadius: "16px", fontFamily: "var(--font-inter)" },
          }}
        />
      </AddressProvider>
    </SessionProvider>
  );
}
