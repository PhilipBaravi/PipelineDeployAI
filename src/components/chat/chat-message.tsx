"use client";

import { useEffect, useState } from "react";
import type { Message } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FilePreview } from "./file-preview";

interface ChatMessageProps {
  message: Message;
  typingDelay: number;
  charsPerTick: number;
}

export function ChatMessage({
  message,
  typingDelay,
  charsPerTick,
}: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [, setIsTyping] = useState(message.role === "assistant");

  useEffect(() => {
    if (message.role === "assistant") {
      setDisplayedContent("");
      setIsTyping(true);
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < message.content.length) {
          // Process multiple characters at once
          const nextChunk = message.content.slice(
            currentIndex,
            currentIndex + charsPerTick
          );
          setDisplayedContent((prev) => prev + nextChunk);
          currentIndex += charsPerTick;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingDelay);

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.role, typingDelay, charsPerTick]);

  return (
    <div
      className={`flex gap-4 ${
        message.role === "assistant" ? "bg-muted/50 p-4 rounded-lg" : ""
      }`}
    >
      <Avatar>
        <AvatarImage
          src={
            message.role === "assistant" ? "/ai-avatar.png" : "/user-avatar.png"
          }
        />
        <AvatarFallback>
          {message.role === "assistant" ? "AI" : "ME"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="font-medium">
          {message.role === "assistant" ? "AI Assistant" : "You"}
        </div>

        {message.file && <FilePreview file={message.file} />}

        <div className="text-sm whitespace-pre-wrap">{displayedContent}</div>
      </div>
    </div>
  );
}
