export interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  isFirstMessage: boolean;
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  onQuickAction: (message: string) => void;
  typingDelay: number;
  charsPerTick: number; // Added new prop
}
