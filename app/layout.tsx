import type { Metadata } from "next";
import "./globals.css";
import {DemoProvider} from "@/components/carebridge/demo-context";

export const metadata: Metadata = {
  title: "CareBridge Canada | One place to find the right care",
  description: "Explore CareBridge Canada: healthcare navigation and care continuity. Synthetic-data demonstration; no live care or personal health information.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><DemoProvider>{children}</DemoProvider></body>
    </html>
  );
}
