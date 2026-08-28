"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Languages } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
];

interface Props {
  value: string;
  onChange: (text: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function VoiceInput({
  value,
  onChange,
  language,
  onLanguageChange,
}: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript + " ";
        else interimText += transcript;
      }
      if (finalText) {
        baseTextRef.current = (baseTextRef.current + " " + finalText).trim();
        onChange(baseTextRef.current);
      }
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        toast.error("Microphone access denied. Enable it in your browser.");
      } else if (e.error !== "no-speech") {
        toast.error("Voice recognition error. Try again.");
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const toggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      baseTextRef.current = value;
      rec.lang = language;
      try {
        rec.start();
        setListening(true);
      } catch {
        /* already started */
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Language selector */}
        <div className="relative">
          <Languages
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-espresso/50"
          />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="rounded-xl border border-sand bg-white/80 py-2 pl-9 pr-8 text-sm outline-none focus:border-terracotta"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mic button */}
        {supported ? (
          <button
            type="button"
            onClick={toggle}
            className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all ${
              listening
                ? "bg-red-500 shadow-lg"
                : "bg-warm-gradient shadow-warm hover:shadow-warm-lg"
            }`}
          >
            {listening && (
              <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-red-500/40" />
            )}
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            {listening ? "Stop" : "Speak"}
          </button>
        ) : (
          <span className="text-xs text-espresso/50">
            Voice input not supported in this browser — type below.
          </span>
        )}

        {listening && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-500">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-1 rounded bg-red-500"
                  animate={{ scaleY: [1, 2.2, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
            Listening…
          </span>
        )}
      </div>

      {/* Textarea (editable, also receives voice) */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            baseTextRef.current = e.target.value;
          }}
          rows={5}
          placeholder="Describe the furniture you want — size, material, colour, style… or tap Speak and say it aloud in your language."
          className="input-field resize-none"
        />
        <AnimatePresence>
          {interim && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute bottom-3 left-4 right-4 truncate text-sm italic text-terracotta/70"
            >
              {interim}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
