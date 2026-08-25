import { Cormorant_Garamond, Inter } from "next/font/google";

// Editorial serif for the PAEGE wordmark and major headings.
export const editorialSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial-serif",
  display: "swap",
});

// Clean grotesque for navigation, product info, filters, buttons, UI.
export const uiSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui-sans",
  display: "swap",
});
