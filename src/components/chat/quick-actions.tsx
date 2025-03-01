import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onQuickAction: (message: string) => void;
}

export function QuickActions({ onQuickAction }: QuickActionsProps) {
  const quickActions = [
    { label: "Say Hello", message: "Hello!" },
    { label: "Say Goodbye", message: "Goodbye!" },
    { label: "Say Adios", message: "¡Adios!" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          onClick={() => onQuickAction(action.message)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
