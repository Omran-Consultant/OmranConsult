import localFont from "next/font/local";
import { Montserrat, Rubik } from "next/font/google";

/**
 * Public-site typography (docs/DESIGN_BASELINE.md §3, SDD A24, A30).
 * Somar stands in for DIN Next LT Arabic (no web licence); its files are converted
 * from the company's OTF set. Montserrat sets the Latin overlines and decorative numbers.
 * Each family is bound to its role in globals.css. Only the weights the design uses are shipped
 * (400, 500, and 700 for accent words), which keeps the preloads small (Home LCP).
 */
export const somar = localFont({
  src: [
    { path: "../../app/fonts/somar/somar-400.woff2", weight: "400", style: "normal" },
    { path: "../../app/fonts/somar/somar-500.woff2", weight: "500", style: "normal" },
    { path: "../../app/fonts/somar/somar-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-somar",
  display: "swap",
});

export const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const publicFontVariables = `${rubik.variable} ${somar.variable} ${montserrat.variable}`;
