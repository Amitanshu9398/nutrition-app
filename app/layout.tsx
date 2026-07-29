import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Fuel Lab — Data-Driven Nutrition Coaching | by SikdarAmitanshu",
    template: "%s · Fuel Lab",
  },
  description:
    "Fuel Lab is data-driven nutrition coaching by SikdarAmitanshu — science-backed plans, real accountability, real results.",
  openGraph: {
    title: "Fuel Lab — Data-Driven Nutrition Coaching",
    description:
      "Science-backed nutrition coaching by SikdarAmitanshu. Submit your intake and start training your nutrition like you train everything else.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${displayFont.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
