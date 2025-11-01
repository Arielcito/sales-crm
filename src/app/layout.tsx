import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { BrandingProvider } from "@/providers/branding-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SalPip",
  description: "A modern CRM built with Next.js, Better Auth, Drizzle, and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <BrandingProvider>{children}</BrandingProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
