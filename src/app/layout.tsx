import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UIProvider } from "@/components/UIProvider";

export const metadata: Metadata = {
  title: "Chisto — обслужване на обекти",
  description: "Платформа за почистване и обходи на имоти",
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className="antialiased">
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  );
}
