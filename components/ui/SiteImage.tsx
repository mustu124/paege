"use client";

import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

// Must mirror next.config.js's images.remotePatterns exactly — this
// is the one place that decides whether a resolved image URL is safe
// to hand to next/image's optimizer.
const TRUSTED_HOSTNAME_PATTERNS = [/(^|\.)supabase\.co$/, /^placehold\.co$/];

function isTrustedRemoteSrc(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return false;
    return TRUSTED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}

// Thin wrapper around next/image used everywhere a resolved product/
// homepage image URL is rendered. next/image's optimizer only
// accepts sources matching next.config.js's remotePatterns and
// throws for anything else — but the admin panel intentionally
// allows storing an arbitrary externally-hosted image URL (not just
// Supabase Storage paths), plus local blob: preview URLs while an
// admin is choosing a file. Known/first-party sources still get real
// optimization via next/image; anything else falls back to a plain
// <img> with equivalent fill/object-fit behavior so it renders
// instead of erroring.
export function SiteImage({ src, alt, className, fill, ...rest }: ImageProps) {
  const srcStr = typeof src === "string" ? src : "";

  if (srcStr && !isTrustedRemoteSrc(srcStr)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={srcStr} alt={alt} className={cn(fill && "absolute inset-0 h-full w-full", className)} />
    );
  }

  return <Image src={src} alt={alt} className={className} fill={fill} {...rest} />;
}
