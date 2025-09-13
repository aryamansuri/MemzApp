import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";
import { Clock } from "lucide-react";

import { X } from "lucide-react";
interface EventCardProps {
  event: Event;
  onDelete?: () => void;
}

export const EventCard = ({ event, onDelete }: EventCardProps) => {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="bg-card border-border/60 hover:shadow-soft transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-foreground leading-tight">
            {event.title}
          </h4>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span className="text-muted-foreground text-xs">{formatDateTime(event.timestamp)}</span>
            {onDelete && (
              <button
                aria-label="Delete event"
                onClick={onDelete}
                className="ml-2 text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {event.description && (
          <p className="text-muted-foreground text-sm mb-3">
            {event.description}
          </p>
        )}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};