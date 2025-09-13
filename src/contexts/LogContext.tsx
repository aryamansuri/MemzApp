import React, { createContext, useContext, useState, useEffect } from 'react';
import { Log, Event } from '@/types';

interface LogContextType {
  logs: Log[];
  addLog: (log: Omit<Log, 'id' | 'createdAt' | 'events'>) => void;
  addEvent: (logId: string, event: Omit<Event, 'id' | 'timestamp'>) => void;
  deleteEvent: (logId: string, eventId: string) => void;
  deleteLog: (logId: string) => void;
  getLog: (id: string) => Log | undefined;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

const STORAGE_KEY = 'memz-logs';

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Log[]>([]);

  // Load logs from localStorage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEY);
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        // Convert date strings back to Date objects
        const logsWithDates = parsedLogs.map((log: any) => ({
          ...log,
          createdAt: new Date(log.createdAt),
          events: log.events.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
          }))
        }));
        setLogs(logsWithDates);
      } catch (error) {
        console.error('Failed to load logs from localStorage:', error);
      }
    }
  }, []);

  // Save logs to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addLog = (logData: Omit<Log, 'id' | 'createdAt' | 'events'>) => {
    const newLog: Log = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      events: [],
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addEvent = (logId: string, eventData: Omit<Event, 'id' | 'timestamp'>) => {
    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      tags: eventData.tags || [],
    };

    setLogs(prev => prev.map(log => 
      log.id === logId 
        ? { ...log, events: [newEvent, ...log.events] }
        : log
    ));
  };


  const deleteEvent = (logId: string, eventId: string) => {
    setLogs(prev => prev.map(log =>
      log.id === logId
        ? { ...log, events: log.events.filter(event => event.id !== eventId) }
        : log
    ));
  };

  const deleteLog = (logId: string) => {
    setLogs(prev => prev.filter(log => log.id !== logId));
  };

  const getLog = (id: string) => {
    return logs.find(log => log.id === id);
  };

  return (
  <LogContext.Provider value={{ logs, addLog, addEvent, deleteEvent, deleteLog, getLog }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogContext = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLogContext must be used within a LogProvider');
  }
  return context;
};