import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatBotWrapper from "../components/ChatBotWrapper";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoScan - Smart Sustainability Analysis",
  description:
    "Transform your waste into opportunities. AI-powered insights for recycling, reusing, and reselling your products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="inter_59dee874-module__9CtR0q__className">
        <AuthProvider>{children}</AuthProvider>
        <ChatBotWrapper />
      </body>
    </html>
  );
}
