import type { Metadata, Viewport } from "next";
import { WorldProvider } from "@/lib/world";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://a-little-world.vercel.app",
  ),
  title: "A Little World Made For You ♡",
  description:
    "A tiny corner of the internet made with love. Somewhere between a website and a love letter.",
  applicationName: "A Little World ♡",
  openGraph: {
    title: "A Little World Made For You ♡",
    description: "A tiny corner of the internet made with love.",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A Little World Made For You ♡",
    description: "A tiny corner of the internet made with love.",
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "A Little World",
  },
  icons: { icon: "/icon.svg", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WorldProvider>{children}</WorldProvider>
      </body>
    </html>
  );
}
