import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { QuickActions } from "./quick-actions";
import type { ChatContainerProps } from "./types";

export function ChatContainer({
  messages,
  isLoading,
  isFirstMessage,
  onSendMessage,
  onFileUpload,
  onQuickAction,
  typingDelay,
  charsPerTick,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          typingDelay={typingDelay}
          charsPerTick={charsPerTick}
        />
      </div>

      {isFirstMessage && (
        <div className="p-4 border-t">
          <QuickActions onQuickAction={onQuickAction} />
        </div>
      )}

      <div className="border-t p-4">
        <MessageInput
          onSendMessage={onSendMessage}
          onFileUpload={onFileUpload}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
