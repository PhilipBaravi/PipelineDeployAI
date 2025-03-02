"use client";

import { useState } from "react";
import { ChatContainer } from "../chat/chat-container";
import type { Message } from "../chat/types";
import { getFeasibilityAnalysis } from "@/lib/services/aiService";
import { useCostData } from "@/lib/contexts/CostDataContext";

export default function AiChat() {
  const { setTableData } = useCostData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getResponse = async (message: string) => {
    setIsLoading(true);
    try {
      let response = await getFeasibilityAnalysis(message);

      // Extract JSON table data from a code block marked with ```json ... ```
      const jsonRegex = /```json\s*([\s\S]*?)```/;
      const match = response.match(jsonRegex);
      if (match) {
        try {
          const jsonPart = match[1].trim();
          const parsed = JSON.parse(jsonPart);
          setTableData(parsed);
        } catch (error) {
          console.error("Error parsing JSON table data", error);
        }
        // Remove the JSON code block from the response text
        response = response.replace(jsonRegex, "").trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: response,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: "Error: Failed to fetch response from AI.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
      console.error(error);
    }
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
    await getResponse(content);
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
    getResponse(`I received your file: ${file.name}`);
  };

  return (
    <ChatContainer
      messages={messages}
      isLoading={isLoading}
      isFirstMessage={isFirstMessage}
      onSendMessage={handleSendMessage}
      onFileUpload={handleFileUpload}
      onQuickAction={handleQuickAction}
      typingDelay={20}
      charsPerTick={3}
    />
  );
}
