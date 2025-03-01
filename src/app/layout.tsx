import type { Metadata } from "next";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PipelineDeployAI",
  description:
    "AI-Driven Deployment Advisor for Next-Generation Telecom Networks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4">
              <SidebarTrigger />
              <div className="font-semibold">PipelineDeployAI</div>
            </header>
            <main className="flex-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
