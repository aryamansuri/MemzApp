export interface Event {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  tags: string[];
}

export interface Log {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  events: Event[];
  color?: string;
}