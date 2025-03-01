"use client";

import { useEffect, useRef } from "react";
import type { Message } from "./types";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  typingDelay: number;
  charsPerTick: number;
}

export function MessageList({
  messages,
  isLoading,
  typingDelay,
  charsPerTick,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollRef]); // Only depend on scrollRef

  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="p-4 space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            typingDelay={typingDelay}
            charsPerTick={charsPerTick}
          />
        ))}
        {isLoading && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
}
