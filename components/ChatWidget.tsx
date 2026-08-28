"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, Mail } from "lucide-react";

interface ChatMsg {
  from: "bot" | "user";
  text: string;
}

const QUICK_REPLIES = [
  "Track my order",
  "Custom furniture",
  "Bulk / trade enquiry",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      from: "bot",
      text: "Hi there! 👋 I'm Anita's assistant. How can I help you find the perfect furniture today?",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  // Welcome tooltip a few seconds after load (until the widget is opened).
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) setShowTooltip(false);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: "user", text: trimmed }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "Thanks! Our team will reach out shortly. Meanwhile, reach us directly below. 🙌",
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end">
      {/* Welcome tooltip */}
      <AnimatePresence>
        {showTooltip && !open && (
          <motion.button
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-3 max-w-[220px] rounded-2xl rounded-br-sm bg-white px-4 py-3 text-left text-sm shadow-warm-lg"
          >
            <span className="font-semibold text-espresso">
              Need help choosing? 🛋️
            </span>
            <span className="mt-0.5 block text-espresso/60">
              Chat with us — we&apos;re online now.
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="mb-3 flex h-[460px] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-warm-lg"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-warm-gradient px-4 py-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <MessageCircle size={18} />
              </span>
              <div className="flex-1">
                <p className="font-semibold leading-tight">Anita Support</p>
                <p className="flex items-center gap-1 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Online now
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1.5 transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-cream/40 p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.from === "user"
                        ? "rounded-br-sm bg-terracotta text-white"
                        : "rounded-bl-sm border border-sand bg-white text-espresso"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Quick replies */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-terracotta/40 bg-white px-3 py-1.5 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Contact shortcuts */}
            <div className="flex items-center justify-center gap-4 border-t border-sand bg-white px-4 py-2 text-xs text-espresso/60">
              <a href="tel:+910000000000" className="flex items-center gap-1 hover:text-terracotta">
                <Phone size={13} /> Call
              </a>
              <a
                href="mailto:hello@anitafurniture.com"
                className="flex items-center gap-1 hover:text-terracotta"
              >
                <Mail size={13} /> Email
              </a>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-sand bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-full border border-sand bg-cream/40 px-4 py-2 text-sm outline-none focus:border-terracotta focus:bg-white"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-gradient text-white transition hover:opacity-90"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-gradient text-white shadow-warm-lg transition hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
