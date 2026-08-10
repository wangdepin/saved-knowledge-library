import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host =
    incoming.get("x-forwarded-host") ??
    incoming.get("host") ??
    "localhost:3000";
  const protocol =
    incoming.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "Saved Knowledge — LinkedIn 收藏知识库",
    description:
      "207 篇 LinkedIn 已保存帖子，按主题与作者整理，支持搜索与筛选。",
    openGraph: {
      title: "Saved Knowledge",
      description: "207 ideas, one searchable library.",
      type: "website",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: "Saved Knowledge — 207 ideas, one searchable library",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Saved Knowledge",
      description: "207 ideas, one searchable library.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
