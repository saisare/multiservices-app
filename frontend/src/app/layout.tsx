import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RootLayoutClient } from "./layout-client";

export const metadata: Metadata = {
  title: "BLG-ENGINEERING | Système Intégré v3.0",
  description: "Système de gestion intégré multi-services - BLG Engineering",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className="antialiased bg-slate-50">
        <ErrorBoundary>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </ErrorBoundary>
      </body>
    </html>
  );
}
