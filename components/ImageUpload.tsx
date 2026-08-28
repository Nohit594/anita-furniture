"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  min?: number;
}

export function ImageUpload({ images, onChange, max = 3, min = 2 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const remaining = max - images.length;
    if (remaining <= 0) {
      toast.error(`You can upload at most ${max} images`);
      return;
    }
    const toUpload = list.slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (res.ok && data.url) {
          uploaded.push(data.url);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (uploaded.length) {
      onChange([...images, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    }
    setUploading(false);
  };

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AnimatePresence>
          {images.map((url, i) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-sand"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              uploadFiles(e.dataTransfer.files);
            }}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all ${
              dragOver
                ? "border-terracotta bg-terracotta/5"
                : "border-sand hover:border-terracotta/50 hover:bg-sand/40"
            }`}
          >
            {uploading ? (
              <Loader2 className="animate-spin text-terracotta" size={28} />
            ) : (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm-gradient text-white">
                  {images.length === 0 ? <UploadCloud size={20} /> : <ImagePlus size={20} />}
                </span>
                <span className="text-xs font-medium text-espresso/60">
                  {images.length === 0 ? "Upload / drop" : "Add more"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      <p className="mt-3 text-xs text-espresso/50">
        Upload {min}–{max} reference images ({images.length}/{max}).{" "}
        {images.length < min && (
          <span className="text-terracotta">
            At least {min} required.
          </span>
        )}
      </p>
    </div>
  );
}
