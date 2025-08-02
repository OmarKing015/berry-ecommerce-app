import type { Metadata } from "next";
import {
  geist,
  geist_mono,
  notoSansArabic,
  amiri,
  cairo,
  almarai,
  lalezar,
  markaziText,
  mada,
  tajawal,
  elMessiri,
  lemonada,
  changa,
  reemKufi,
  roboto,
  openSans,
  lato,
  montserrat,
  oswald,
  playfairDisplay,
  merriweather,
  sourceSansPro,
  nunito,
  poppins,
} from "@/public/fonts";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { SanityLive } from "@/sanity/lib/live";
import { ContextProvider } from "@/context/context";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mazagk",
  description: "Wear Your Mood",
};

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
            className={`${geist.variable} ${geist_mono.variable} ${notoSansArabic.variable} ${amiri.variable} ${cairo.variable} ${almarai.variable} ${lalezar.variable} ${markaziText.variable} ${mada.variable} ${tajawal.variable} ${elMessiri.variable} ${lemonada.variable} ${changa.variable} ${reemKufi.variable} antialiased
 ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${oswald.variable} ${playfairDisplay.variable} ${merriweather.variable} ${sourceSansPro.variable} ${nunito.variable} ${poppins.variable}`}
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
