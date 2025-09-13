import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton = ({ onClick, className }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-strong bg-gradient-primary hover:shadow-lg",
        "transition-all duration-300 hover:scale-110 z-50",
        "border-0 text-primary-foreground hover:bg-gradient-primary",
        className
      )}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};