"use client";

import AiChat from "@/components/home/ai-chat";
import ChatOutput from "@/components/home/chat-output";
import { CostDataProvider } from "@/lib/contexts/CostDataContext";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/components/google-map-c/map-component"),
  { ssr: false }
);

export default function Home() {
  return (
    <CostDataProvider>
      <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left side - AI Chat (40% width) */}
        <div className="w-[40%] h-full bg-muted/30 border-r overflow-hidden">
          <AiChat />
        </div>

        {/* Right side container (60% width) with padding */}
        <div className="w-[60%] h-full p-2.5 flex flex-col overflow-hidden">
          {/* Top container (40% height) */}
          <div className="h-[50%] bg-muted/20 rounded-lg mb-2.5 overflow-hidden">
            <MapComponent />
          </div>

          {/* Bottom container (60% height) - Scrollable */}
          <div className="h-[50%] bg-muted/20 rounded-lg">
            <ChatOutput />
          </div>
        </div>
      </div>
    </CostDataProvider>
  );
}
