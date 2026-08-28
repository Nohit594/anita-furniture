"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { VoiceInput } from "@/components/VoiceInput";
import { PageTransition } from "@/components/PageTransition";
import { Check, ArrowRight, ArrowLeft, Send, Sparkles } from "lucide-react";

const STEPS = ["Photos", "Describe", "Review"];

export default function CustomOrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [submitting, setSubmitting] = useState(false);

  const canNext =
    (step === 0 && images.length >= 2) ||
    (step === 1 && description.trim().length >= 5) ||
    step === 2;

  const submit = async () => {
    if (!session) {
      signIn("google", { callbackUrl: "/custom-order" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          images,
          description,
          voiceLanguage: language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not submit order");
        return;
      }
      toast.success("Request submitted! We'll review and set a price soon.");
      router.push(`/orders/${data._id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-6 py-14">
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-white/60 px-4 py-1.5 text-sm font-medium text-terracotta-dark">
            <Sparkles size={14} /> Custom request
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold">
            Design your dream piece
          </h1>
          <p className="mt-2 text-espresso/70">
            Upload references, describe it in your language, and we&apos;ll craft
            a quote.
          </p>
        </header>

        {/* Progress bar */}
        <div className="mt-10 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                    i < step
                      ? "border-terracotta bg-terracotta text-white"
                      : i === step
                        ? "border-terracotta bg-white text-terracotta"
                        : "border-sand bg-white text-espresso/40"
                  }`}
                >
                  {i < step ? <Check size={18} /> : i + 1}
                </div>
                <span className="mt-1 text-xs font-medium text-espresso/60">
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded bg-sand">
                  <motion.div
                    className="h-full bg-terracotta"
                    initial={{ width: "0%" }}
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card mt-8">
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="font-display text-xl font-bold">
                Upload 2–3 reference photos
              </h2>
              <p className="mt-1 text-sm text-espresso/60">
                Show us the shape, style, or inspiration you have in mind.
              </p>
              <div className="mt-5">
                <ImageUpload images={images} onChange={setImages} />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="font-display text-xl font-bold">
                Describe what you want
              </h2>
              <p className="mt-1 text-sm text-espresso/60">
                Type it, or tap Speak and describe it aloud — Hindi, English, or
                any language.
              </p>
              <div className="mt-5">
                <VoiceInput
                  value={description}
                  onChange={setDescription}
                  language={language}
                  onLanguageChange={setLanguage}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="font-display text-xl font-bold">Review & submit</h2>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {images.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="aspect-square rounded-xl border border-sand object-cover"
                  />
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-sand/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
                  Your description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-espresso/80">
                  {description}
                </p>
              </div>
              <p className="mt-4 text-sm text-espresso/60">
                After you submit, an admin reviews your request and sets a price.
                You&apos;ll be able to accept it or make a counter-offer.
              </p>
            </motion.div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost !py-2 disabled:invisible"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext && setStep((s) => s + 1)}
                disabled={!canNext}
                className="btn-primary !py-2"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting || status === "loading"}
                className="btn-primary !py-2"
              >
                <Send size={16} />
                {submitting
                  ? "Submitting…"
                  : session
                    ? "Submit request"
                    : "Sign in & submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
