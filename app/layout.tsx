import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { SanityLive } from "@/sanity/lib/live";
import { ContextProvider } from "@/context/context";
import Footer from "@/components/Footer";
import { draftMode } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
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
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
        >
          <ContextProvider>
            <main>
              <Header />
              {children}
              <Footer />
            </main>
            {draftMode().isEnabled && <SanityLive />}
          </ContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
