import React, { createContext, useContext, useState, useEffect } from 'react';
import { Log, Event } from '@/types';
import { db } from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';

interface LogContextType {
  logs: Log[];
  addLog: (log: Omit<Log, 'id' | 'createdAt' | 'events'>) => void;
  addEvent: (logId: string, event: Omit<Event, 'id' | 'timestamp'>) => void;
  deleteEvent: (logId: string, eventId: string) => void;
  deleteLog: (logId: string) => void;
  getLog: (id: string) => Log | undefined;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

const LOGS_COLLECTION = 'logs';

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Log[]>([]);

  // Real-time Firestore sync
  useEffect(() => {
    const q = query(collection(db, LOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData: Log[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          events: (data.events || []).map((event: any) => ({
            ...event,
            timestamp: event.timestamp instanceof Timestamp ? event.timestamp.toDate() : new Date(event.timestamp)
          })),
          color: data.color,
        };
      });
      setLogs(logsData);
    });
    return () => unsubscribe();
  }, []);

  const addLog = async (logData: Omit<Log, 'id' | 'createdAt' | 'events'>) => {
    const { title, description, color } = logData;
    const docData: any = {
      title,
      createdAt: new Date(),
      events: [],
    };
    if (description !== undefined && description !== "") docData.description = description;
    if (color !== undefined) docData.color = color;
    await addDoc(collection(db, LOGS_COLLECTION), docData);
  };

  const addEvent = async (logId: string, eventData: Omit<Event, 'id' | 'timestamp'>) => {
    const event: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      tags: eventData.tags || [],
    };
    const logRef = doc(db, LOGS_COLLECTION, logId);
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      const logData = logSnap.data();
      const prevEvents = Array.isArray(logData.events) ? logData.events : [];
      await updateDoc(logRef, {
        events: [event, ...prevEvents],
      });
    }
  };


  const deleteEvent = async (logId: string, eventId: string) => {
    const logRef = doc(db, LOGS_COLLECTION, logId);
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      const logData = logSnap.data();
      const prevEvents = Array.isArray(logData.events) ? logData.events : [];
      const updatedEvents = prevEvents.filter((event: any) => event.id !== eventId);
      await updateDoc(logRef, { events: updatedEvents });
    }
  };

  const deleteLog = async (logId: string) => {
    await deleteDoc(doc(db, LOGS_COLLECTION, logId));
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