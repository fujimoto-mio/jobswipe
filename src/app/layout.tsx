import type { Metadata, Viewport } from "next";
import { Montserrat, Noto_Sans_JP } from "next/font/google";
import { APP_PAGE_TITLE } from "@/lib/brand";
import "./globals.css";
import "./landing.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_PAGE_TITLE,
  description: "求人動画をスワイプするだけで探せる、新しい求職体験。職場の雰囲気まで伝わるから、ミスマッチの少ない転職・就活ができます。",
  keywords: ["求人", "就活", "スワイプ", "動画", "採用", "転職"],
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#27A9B5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">{children}</body>
    </html>
  );
}
