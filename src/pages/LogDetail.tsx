import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { AddEventForm } from "@/components/AddEventForm";
import { TagAnalytics } from "@/components/TagAnalytics";
import { useLogContext } from "@/contexts/LogContext";
import { ArrowLeft, Calendar, BarChart } from "lucide-react";
import { useState } from "react";

const LogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLog, addEvent } = useLogContext();
  const [showAnalytics, setShowAnalytics] = useState(false);

  const log = id ? getLog(id) : undefined;

  if (!log) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Log not found</h2>
          <p className="text-muted-foreground mb-4">The log you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleAddEvent = (eventData: { title: string; description?: string; tags: string[] }) => {
    addEvent(log.id, eventData);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-soft">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Logs
            </Button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{log.title}</h1>
            {log.description && (
              <p className="text-muted-foreground text-lg">{log.description}</p>
            )}
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Created {formatDate(log.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {showAnalytics ? 'Tag Analytics' : `Events (${log.events.length})`}
            </h2>
            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <BarChart className="w-4 h-4" />
              {showAnalytics ? 'Show Events' : 'Show Analytics'}
            </Button>
          </div>

          {showAnalytics ? (
            <TagAnalytics log={log} />
          ) : (
            <>
              {/* Add Event Form */}
              <AddEventForm onAddEvent={handleAddEvent} />

              {/* Events List */}
              {log.events.length > 0 ? (
                <div className="space-y-4">
                  {log.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg mb-2">No events yet</div>
                  <p className="text-muted-foreground text-sm">
                    Start adding events to track what happens in this log.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetail;