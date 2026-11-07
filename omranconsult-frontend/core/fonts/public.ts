import localFont from "next/font/local";
import { Rubik } from "next/font/google";

/**
 * Public-site typography (docs/DESIGN_BASELINE.md §3).
 * Somar is licensed for web use; its files are converted from the company's OTF set.
 * Each family is bound to its locale in globals.css via html[lang].
 */
export const somar = localFont({
  src: [
    { path: "../../app/fonts/somar/somar-400.woff2", weight: "400", style: "normal" },
    { path: "../../app/fonts/somar/somar-500.woff2", weight: "500", style: "normal" },
    { path: "../../app/fonts/somar/somar-600.woff2", weight: "600", style: "normal" },
    { path: "../../app/fonts/somar/somar-700.woff2", weight: "700", style: "normal" },
    { path: "../../app/fonts/somar/somar-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-somar",
  display: "swap",
});

export const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

export const publicFontVariables = `${rubik.variable} ${somar.variable}`;
