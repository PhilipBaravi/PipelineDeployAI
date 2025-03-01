export function TypingIndicator() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        AI
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
      </div>
    </div>
  );
}
