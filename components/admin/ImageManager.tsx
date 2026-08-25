"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Star, Upload, X } from "lucide-react";

import type { Database } from "@/lib/types/database";
import { getStorageUrl } from "@/lib/storage";
import {
  deleteProductImageAction,
  reorderImageAction,
  replaceProductImageAction,
  setPrimaryImageAction,
  updateProductImageAltTextAction,
  uploadProductImageAction,
} from "@/app/(admin)/admin/products/actions";
import { Button } from "@/components/ui/Button";
import { SiteImage } from "@/components/ui/SiteImage";

type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];

function ImageTile({
  productId,
  image,
  index,
  total,
  pending,
  onAction,
}: {
  productId: string;
  image: ProductImageRow;
  index: number;
  total: number;
  pending: boolean;
  onAction: (fn: () => Promise<{ error?: string }>) => void;
}) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState(image.alt_text ?? "");
  const [replacePreview, setReplacePreview] = useState<string | null>(null);

  function onReplaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacePreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.set("file", file);
    onAction(async () => {
      const result = await replaceProductImageAction(productId, image.id, fd);
      setReplacePreview(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
      return result;
    });
  }

  function onAltBlur() {
    if (altText === (image.alt_text ?? "")) return;
    onAction(() => updateProductImageAltTextAction(productId, image.id, altText));
  }

  return (
    <div className="border border-border p-2">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
        <SiteImage
          src={replacePreview ?? getStorageUrl("product-images", image.storage_path)}
          alt={image.alt_text ?? ""}
          fill
          sizes="200px"
          className="object-cover"
        />
        {image.is_primary && (
          <span className="absolute left-1.5 top-1.5 bg-cream/90 px-1.5 py-0.5 font-sans text-[10px] uppercase text-charcoal-900">
            Primary
          </span>
        )}
      </div>

      <input
        type="text"
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        onBlur={onAltBlur}
        disabled={pending}
        placeholder="Alt text (optional)"
        aria-label={`Alt text for image ${index + 1}`}
        className="mt-2 w-full border border-border bg-cream-50 px-2 py-1 font-sans text-xs text-charcoal-900 outline-none focus:border-charcoal-900 disabled:opacity-50"
      />

      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Move earlier"
            disabled={pending || index === 0}
            onClick={() => onAction(() => reorderImageAction(productId, image.id, "up"))}
            className="p-1 text-charcoal-700 disabled:text-charcoal-500/30"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Move later"
            disabled={pending || index === total - 1}
            onClick={() => onAction(() => reorderImageAction(productId, image.id, "down"))}
            className="p-1 text-charcoal-700 disabled:text-charcoal-500/30"
          >
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex gap-1">
          {!image.is_primary && (
            <button
              type="button"
              aria-label="Set as primary"
              disabled={pending}
              onClick={() => onAction(() => setPrimaryImageAction(productId, image.id))}
              className="p-1 text-charcoal-700 hover:text-burgundy"
            >
              <Star size={14} strokeWidth={1.5} />
            </button>
          )}
          <label
            aria-label="Replace image"
            className="cursor-pointer p-1 text-charcoal-700 hover:text-burgundy"
          >
            <Upload size={14} strokeWidth={1.5} />
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              disabled={pending}
              onChange={onReplaceFileChange}
              className="hidden"
            />
          </label>
          <button
            type="button"
            aria-label="Delete image"
            disabled={pending}
            onClick={() => onAction(() => deleteProductImageAction(productId, image.id, image.storage_path))}
            className="p-1 text-charcoal-700 hover:text-burgundy"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImageManager({ productId, images }: { productId: string; images: ProductImageRow[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadPreview(file ? URL.createObjectURL(file) : null);
  }

  function onUpload(formData: FormData) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await uploadProductImageAction(productId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (urlInputRef.current) urlInputRef.current.value = "";
        setUploadPreview(null);
      }
    });
  }

  function run(action: () => Promise<{ error?: string }>) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      {images.length === 0 ? (
        <p className="font-sans text-sm text-charcoal-500">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, i) => (
            <ImageTile
              key={image.id}
              productId={productId}
              image={image}
              index={i}
              total={images.length}
              pending={pending}
              onAction={run}
            />
          ))}
        </div>
      )}

      <form action={onUpload} className="mt-6 flex flex-wrap items-end gap-4">
        {!useUrl ? (
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Upload Image</span>
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept="image/*"
              onChange={onFileSelected}
              className="font-sans text-sm text-charcoal-900"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Image URL</span>
            <input
              ref={urlInputRef}
              type="url"
              name="imageUrl"
              placeholder="https://…"
              className="w-64 border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Alt Text (optional)</span>
          <input
            name="altText"
            placeholder="Describe the image"
            className="w-48 border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            setUseUrl((v) => !v);
            setUploadPreview(null);
          }}
          className="link-underline font-sans text-xs uppercase tracking-wider text-charcoal-700"
        >
          {useUrl ? "Upload a file instead" : "Use an image URL instead"}
        </button>

        <Button type="submit" variant="outline" disabled={pending}>
          {useUrl ? "Add Image" : "Upload"}
        </Button>

        {uploadPreview && !useUrl && (
          <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden border border-border bg-cream-100">
            <SiteImage src={uploadPreview} alt="Selected file preview" fill sizes="64px" className="object-cover" />
          </div>
        )}
      </form>

      {error && <p className="mt-2 font-sans text-xs text-burgundy">{error}</p>}
    </div>
  );
}
