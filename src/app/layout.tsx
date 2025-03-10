import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "../providers/WalletProvider";
import Navbar from "./_components/Navbar";
import { AI } from "./_components/Transaction";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptiFi",
  description:
    "PromptiFi – AI-powered crypto platform for seamless token swaps, cross-chain bridging, real-time portfolio tracking, and live crypto stats. Fast, secure, and intelligent trading.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={`${geistSans.className}antialiased`}>
        <SessionProvider session={session}>
          <AI>
            <WalletProvider>
              <Navbar />
              {children}
            </WalletProvider>
          </AI>
        </SessionProvider>
      </body>
    </html>
  );
}
