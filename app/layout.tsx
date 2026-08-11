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
      "5,851 条 LinkedIn、X 与 GitHub 收藏，按来源、主题、作者、编程语言与活跃度整理。",
    openGraph: {
      title: "Saved Knowledge",
      description:
        "5,851 saved ideas from LinkedIn, X and GitHub, one searchable library.",
      type: "website",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: "Saved Knowledge — 5,851 ideas from LinkedIn, X and GitHub",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Saved Knowledge",
      description:
        "5,851 saved ideas from LinkedIn, X and GitHub, one searchable library.",
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
