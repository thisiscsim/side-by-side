import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

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
        <SidebarProvider defaultOpen={true}>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
