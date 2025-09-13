import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Event } from "@/types";
import { Plus } from "lucide-react";
import { TagInput } from "./TagInput";

interface AddEventFormProps {
  onAddEvent: (event: Omit<Event, 'id' | 'timestamp'>) => void;
}

export const AddEventForm = ({ onAddEvent }: AddEventFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags,
    });

    setTitle("");
    setDescription("");
    setTags([]);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card 
        className="bg-card border-border/60 hover:shadow-soft transition-all duration-200 cursor-pointer border-dashed"
        onClick={() => setIsExpanded(true)}
      >
        <div className="p-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Add new event</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-soft">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-title" className="text-sm font-medium text-foreground">
            Event Title
          </Label>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened?"
            className="bg-input border-border focus:ring-ring focus:border-ring"
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-description" className="text-sm font-medium text-foreground">
            Description (optional)
          </Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            className="bg-input border-border focus:ring-ring focus:border-ring min-h-[60px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Tags
          </Label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Add tags like 'dinner', 'go-karting'..."
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setTitle("");
              setDescription("");
              setTags([]);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim()}
            size="sm"
            className="flex-1 bg-gradient-primary hover:bg-gradient-primary hover:opacity-90"
          >
            Add Event
          </Button>
        </div>
      </form>
    </Card>
  );
};