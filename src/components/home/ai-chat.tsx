"use client";

import { useState } from "react";
import { ChatContainer } from "../chat/chat-container";
import type { Message } from "../chat/types";

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const simulateResponse = async (message: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response =
      "This is a simulated response to your message: " +
      message +
      "\n\nI can help you with various tasks. Feel free to ask any questions!";

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsFirstMessage(false);
    await simulateResponse(content);
  };

  const handleQuickAction = (message: string) => {
    handleSendMessage(message);
  };

  const handleFileUpload = (file: File) => {
    const fileMessage: Message = {
      id: Date.now(),
      content: `Uploaded file: ${file.name}`,
      role: "user",
      timestamp: new Date(),
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };

    setMessages((prev) => [...prev, fileMessage]);
    setIsFirstMessage(false);
    simulateResponse(`I received your file: ${file.name}`);
  };

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      isFirstMessage={isFirstMessage}
      onSendMessage={handleSendMessage}
      onFileUpload={handleFileUpload}
      onQuickAction={handleQuickAction}
      typingDelay={20} // Reduced from 50 to 20ms
      charsPerTick={3} // New prop: characters to show per tick
    />
  );
}
