import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryProvider } from "@/lib/cache/queryProvider";
import { initSentry } from "@/lib/monitoring/sentry";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Initialize monitoring in production
if (typeof window === "undefined") {
  initSentry();
}

export const metadata: Metadata = {
  title: "Water Pump Dashboard",
  description: "Monitor and control your water pump system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
