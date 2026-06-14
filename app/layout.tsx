import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "배고파요 🐾",
  description: "닥스훈트와 함께하는 배달앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}