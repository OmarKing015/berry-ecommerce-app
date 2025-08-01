import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic, Amiri, Cairo, Almarai, Lalezar, Markazi_Text, Mada, Tajawal, El_Messiri, Lemonada, Changa, Reem_Kufi } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { SanityLive } from "@/sanity/lib/live";
import { ContextProvider } from "@/context/context";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  display: "swap",
});

const almarai = Almarai({
  variable: "--font-almarai",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const lalezar = Lalezar({
  variable: "--font-lalezar",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const markaziText = Markazi_Text({
  variable: "--font-markazi-text",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const mada = Mada({
  variable: "--font-mada",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const lemonada = Lemonada({
  variable: "--font-lemonada",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const changa = Changa({
  variable: "--font-changa",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

const reemKufi = Reem_Kufi({
  variable: "--font-reem-kufi",
  weight: "400",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  
  title: 'Mazagk',
  description: 'Wear Your Mood',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ContextProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} ${amiri.variable} ${cairo.variable} ${almarai.variable} ${lalezar.variable} ${markaziText.variable} ${mada.variable} ${tajawal.variable} ${elMessiri.variable} ${lemonada.variable} ${changa.variable} ${reemKufi.variable} antialiased`}
          >
            <main>
              <Header />
              {children}
              <Footer />
            </main>
            <SanityLive />
          </body>
        </html>
      </ContextProvider>
    </ClerkProvider>
  );
}
