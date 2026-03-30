import type { Metadata } from "next";
import { validateEnv } from "@/lib/env";

validateEnv();

import localFont from "next/font/local";
import "./globals.css";
import { Geist, Outfit, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const outfit = Outfit({subsets:['latin'],variable:'--font-outfit'});
const inter = Inter({subsets:['latin'],variable:'--font-inter'});

const satoshi = localFont({
  src: [
    {
      path: "../public/TTF/Satoshi-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/TTF/Satoshi-VariableItalic.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
});

const analogue = localFont({
  src: [
    {
      path: "../public/TrueType/AnalogueRed-35Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/TrueType/AnalogueRed-45Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/TrueType/AnalogueRed-55Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/TrueType/AnalogueRed-65Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/TrueType/AnalogueRed-75Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/TrueType/AnalogueRed-85Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-analogue",
});

const poppins = localFont({
  src: [
    {
      path: "../public/Poppins/Poppins-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/Poppins/Poppins-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Akaro AI | Your team's brain, always accessible",
    template: "%s | Akaro AI"
  },
  description: "Akaro keeps your collective intelligence flowing across every tool, every conversation, and every critical decision.",
  keywords: ["RFP", "Team Intelligence", "Knowledge Management", "AI Productivity"],
  authors: [{ name: "Akaro Team" }],
  creator: "Akaro",
  publisher: "Akaro",
  metadataBase: new URL("https://akaro.ai"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://akaro.ai",
    siteName: "Akaro",
    title: "Akaro | Your team's brain, always accessible",
    description: "Secure and intelligent platform for managing team knowledge and RFPs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Akaro Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akaro | Collective Intelligence Platform",
    description: "Your team's brain, always accessible.",
    images: ["/og-image.png"],
    creator: "@akaroai",
  },
  alternates: {
    canonical: "https://akaro.ai",
  },
  category: "technology",
};

export const viewport = {
  themeColor: "#3100be",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geist.variable, analogue.variable, satoshi.variable, outfit.variable, poppins.variable, inter.variable)} suppressHydrationWarning>
      <body
        className={`${analogue.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          toastOptions={{
            style: { maxWidth: '90vw' }
          }}
        />
      </body>
    </html>
  );
}
