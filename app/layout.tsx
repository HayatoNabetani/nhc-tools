"use client";

import { RecoilRoot } from "recoil";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header/Header";
import GoogleAnalytics from "./features/GoogleAnalytics/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <title>NHC Tools</title>
        <meta name="description" content="Description" />
        <GoogleAnalytics />
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
