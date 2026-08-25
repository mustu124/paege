import type { Metadata } from "next";

import { editorialSerif, uiSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PAEGE",
    template: "%s | PAEGE",
  },
  description: "Considered clothing for the modern wardrobe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${editorialSerif.variable} ${uiSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
