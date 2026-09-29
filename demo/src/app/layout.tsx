import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PalletProvider } from "@pallet/ui";
import { Frame } from "@/components/frame";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pallet",
  description: "Pallet —— Next.js + Tailwind v4 + shadcn/ui 的 UI 起步套件",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning 是 next-themes 要求的：
    // 主题 class 在客户端注入，服务端渲染时还不存在
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <PalletProvider>
          <Frame>{children}</Frame>
        </PalletProvider>
      </body>
    </html>
  );
}
