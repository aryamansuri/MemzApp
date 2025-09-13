import { Card } from "@/components/ui/card";
import { Log } from "@/types";
import { Clock, FileText } from "lucide-react";

import { X } from "lucide-react";
interface LogCardProps {
  log: Log;
  onClick: () => void;
  onDelete?: () => void;
}

export const LogCard = ({ log, onClick, onDelete }: LogCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-medium hover:-translate-y-1 bg-card border-border/60 relative"
      onClick={onClick}
    >
      <button
        aria-label="Delete log"
        onClick={e => {
          e.stopPropagation();
          onDelete && onDelete();
        }}
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 z-10"
        style={{ display: onDelete ? undefined : 'none' }}
      >
        <X className="w-4 h-4" />
      </button>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {log.title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {formatDate(log.createdAt)}
          </div>
        </div>
        {log.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {log.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground text-sm">
            <FileText className="w-4 h-4 mr-1" />
            {log.events.length} {log.events.length === 1 ? 'event' : 'events'}
          </div>
          <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Card>
  );
};