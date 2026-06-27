import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobSwipe - 動画でいい仕事に出会う",
  description: "求人動画をスワイプするだけで探せる、新しい求職体験。職場の雰囲気まで伝わるから、ミスマッチの少ない転職・就活ができます。",
  keywords: ["求人", "就活", "スワイプ", "動画", "採用", "転職"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">{children}</body>
    </html>
  );
}
