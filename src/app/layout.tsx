import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "oo-quest",
  description: "プロジェクト知識をクイズで学ぶRPG風アプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
