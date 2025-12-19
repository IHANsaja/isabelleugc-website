import type { Metadata } from "next";
import { Playfair_Display, Instrument_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import SoundButton from "@/components/SoundButton";
import { SoundProvider } from "@/context/SoundContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Gang",
  description: "Step into a world where every detail glows - Image Gang delivers premium visual content and creative experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${instrumentSans.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <SoundProvider>
          <CustomCursor />
          <SoundButton />
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}
