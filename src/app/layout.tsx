import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Harvey - Side by Side Experience",
  description: "AI chat interface with artifact generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SidebarProvider defaultOpen={false}>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
