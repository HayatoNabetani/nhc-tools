"use client";

import { RecoilRoot } from "recoil";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/features/Header/Header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <title>Create Next App</title>
        <meta name="description" content="Description" />
      </head>
      <body className={inter.className}>
        <RecoilRoot>
          <Header />
          {children}
        </RecoilRoot>
      </body>
    </html>
  );
}
