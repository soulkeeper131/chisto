import type { Metadata } from "next";
import "./globals.css";
import { UIProvider } from "@/components/UIProvider";
import Topbar from "@/components/Topbar";
import Tabs from "@/components/Tabs";

export const metadata: Metadata = {
  title: "Chisto — обслужване на обекти",
  description: "Платформа за почистване и обходи на имоти",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <head>
        <meta name="theme-color" content="#0F766E" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" crossOrigin="" />
      </head>
      <body className="antialiased">
        <UIProvider>
          <div id="app">
            <Topbar />
            <Tabs />
            <div className="main">{children}</div>
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
