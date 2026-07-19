import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chisto — обслужване на обекти",
  description: "Платформа за почистване и обходи на имоти",
  manifest: "/manifest.json",
  themeColor: "#0F766E",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <head>
        <meta name="theme-color" content="#0F766E" />
      </head>
      <body className="antialiased">
        <div id="app">
          <Topbar />
          <Tabs />
          <div className="main">{children}</div>
        </div>
        <div id="scrim" className="scrim" />
        <div id="sheet" className="sheet">
          <div id="sheetHead" className="sheet-head" />
          <div id="sheetBody" className="sheet-body" />
          <div id="sheetFoot" className="sheet-foot" />
        </div>
        <div id="toast" className="toast" />
      </body>
    </html>
  );
}

import Topbar from "@/components/Topbar";
import Tabs from "@/components/Tabs";
