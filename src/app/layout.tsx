import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "议会回环",
  description: "一个能把10条讨论自动总结成1条智慧的AI对话系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
