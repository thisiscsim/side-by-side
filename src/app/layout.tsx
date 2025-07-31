import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { HeroUIProvider } from "@heroui/react";

export const metadata: Metadata = {
  title: "Harvey Demo",
  description: "Professional Class AI for Legal Professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <HeroUIProvider>
          <SidebarProvider defaultOpen={true}>
            {children}
          </SidebarProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />
        </HeroUIProvider>
      </body>
    </html>
  );
}
