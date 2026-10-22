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
    title: "Saved Knowledge — LinkedIn + X + GitHub 收藏知识库",
    description:
      "6,674 条 LinkedIn、X 与 GitHub 收藏，按来源、主题、作者、编程语言与活跃度整理。",
    openGraph: {
      title: "Saved Knowledge",
      description:
        "6,674 saved ideas from LinkedIn, X and GitHub, one searchable library.",
      type: "website",
      images: [
        {
          url: `${origin}/og-2026-10-22.png`,
          width: 1731,
          height: 909,
          alt: "Saved Knowledge — 6,674 ideas from LinkedIn, X and GitHub",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Saved Knowledge",
      description:
        "6,674 saved ideas from LinkedIn, X and GitHub, one searchable library.",
      images: [`${origin}/og-2026-10-22.png`],
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
