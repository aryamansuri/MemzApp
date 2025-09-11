import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
} from "recharts";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";


export default function App() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", notes: "", tags: "" });
  const [newLogName, setNewLogName] = useState("");
  const [view, setView] = useState("logs"); // "logs" | "stats"
  const [tagQuery, setTagQuery] = useState("");


  // Update selectedLog and persist to localStorage
  useEffect(() => {
    if (selectedLog?.id) {
      localStorage.setItem("selectedLogId", selectedLog.id);
    } else {
      localStorage.removeItem("selectedLogId");
    }
  }, [selectedLog]);


  // When logs load, if selectedLog is just an id, fill in the rest of the log object
  useEffect(() => {
    if (selectedLog?.id && (!selectedLog.name || !logs.find(l => l.id === selectedLog.id))) {
      const found = logs.find(l => l.id === selectedLog.id);
      if (found) setSelectedLog(found);
    }
  }, [logs, selectedLog]);


  // Fetch logs in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "logs"), (snapshot) => {
      const logsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
    });
    return () => unsubscribe();
  }, []);


  // Fetch events for selected log in real time
  useEffect(() => {
    if (!selectedLog) {
      setEvents([]);
      return;
    }
    const eventsRef = collection(db, "logs", selectedLog.id, "events");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    });
    return () => unsubscribe();
  }, [selectedLog?.id]);


  async function handlePromptCreateLog() {
    const name = prompt("Enter new log name:");
    if (name && name.trim()) {
      await addDoc(collection(db, "logs"), { name: name.trim() });
    }
  }


  async function handleCreateLog() {
    if (!newLogName.trim()) return;
    await addDoc(collection(db, "logs"), { name: newLogName });
    setNewLogName("");
  }


  // Add this function inside your App component:
  async function handleDeleteLog(logId) {
    // Delete all events in the log's events subcollection
    const eventsRef = collection(db, "logs", logId, "events");
    const eventsSnapshot = await getDocs(eventsRef);
    const deletePromises = eventsSnapshot.docs.map((eventDoc) =>
      deleteDoc(doc(db, "logs", logId, "events", eventDoc.id))
    );
    await Promise.all(deletePromises);


    // Delete the log itself
    await deleteDoc(doc(db, "logs", logId));


    // If the deleted log was selected, clear selection
    if (selectedLog?.id === logId) {
      setSelectedLog(null);
    }
  }


  async function handleAddEvent(e) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    const eventsRef = collection(db, "logs", selectedLog.id, "events");
    await addDoc(eventsRef, {
      title: form.title,
      date: form.date,
      notes: form.notes,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setForm({ title: "", date: "", notes: "", tags: "" });
  }


  async function handleDeleteEvent(eventId) {
    const eventRef = doc(db, "logs", selectedLog.id, "events", eventId);
    await deleteDoc(eventRef);
  }


  // Stats calculations
  const filteredEvents = tagQuery
    ? events.filter((e) => e.tags?.includes(tagQuery))
    : events;


  const tagCounts = {};
  events.forEach((e) => {
    e.tags?.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });


  let coTagCounts = {};
  if (tagQuery) {
    filteredEvents.forEach((e) => {
      e.tags?.forEach((t) => {
        if (t !== tagQuery) {
          coTagCounts[t] = (coTagCounts[t] || 0) + 1;
        }
      });
    });
  }


  const tagBarData = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 tags


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">Memz</h1>


      {/* Navigation + Add Log Button */}
      <div className="flex items-center gap-4 mb-8">
        {/* Circular + button */}
        <button
          onClick={handlePromptCreateLog}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500 text-white text-3xl font-bold shadow hover:bg-green-600 transition"
          title="Add new log"
        >
          +
        </button>
        {/* Only show Stats button if a log is selected */}
        {selectedLog && (
          <button
            className={`px-4 py-2 rounded-xl ${view === "stats" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            onClick={() => setView(view === "stats" ? "logs" : "stats")}
          >
            {view === "stats" ? "Back to Log" : "Stats"}
          </button>
        )}
      </div>


      {/* ================== LOG CARDS ================== */}
      {!selectedLog && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">No logs yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`relative flex items-center justify-center h-64 bg-white shadow-xl rounded-3xl cursor-pointer border-4 transition-all duration-200
${selectedLog?.id === log.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-blue-400 hover:bg-yellow-50 hover:shadow-2xl"
                  }
`}
                onClick={() => {
                  setSelectedLog(log);
                  setView("logs");
                }}
                style={{
                  minWidth: "260px",
                  boxSizing: "border-box",
                }}
              >
                {/* Delete button at top left */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Are you sure you want to delete the log "${log.name}" and all its events?`
                      )
                    ) {
                      handleDeleteLog(log.id);
                    }
                  }}
                  className="absolute top-3 left-3 text-red-400 hover:text-red-600 text-lg bg-white/80 rounded-full px-2 py-0.5 shadow"
                  title="Delete log"
                >
                  ×
                </button>
                {/* Centered log name */}
                <span className="text-3xl font-bold text-gray-800 text-center select-none">
                  {log.name}
                </span>
              </div>
            ))
          )}
        </div>
      )}


      {/* ================== LOG VIEW ================== */}
      {selectedLog && view === "logs" && (
        <>
          {/* Current log name */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedLog(null)}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2"
              title="Back to all logs"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-blue-700">{selectedLog.name}</h2>
          </div>
          {/* Event Form */}
          <form
            onSubmit={handleAddEvent}
            className="max-w-md w-full bg-white shadow-md rounded-2xl p-4 mb-6"
          >
            {/* ...event form fields... */}
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event Title"
              className="w-full border p-2 rounded-xl mb-2"
              required
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border p-2 rounded-xl mb-2"
              required
            />
            <textarea
              name="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="w-full border p-2 rounded-xl mb-2"
              rows="3"
            />
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags (comma separated)"
              className="w-full border p-2 rounded-xl mb-2"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold p-2 rounded-xl hover:bg-blue-600"
            >
              Add Event
            </button>
          </form>


          {/* Events List */}
          <div className="max-w-md w-full space-y-4">
            {events.length === 0 ? (
              <p className="text-center text-gray-500">No events added yet.</p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-start"
                >
                  <div>
                    <h2 className="text-lg font-semibold">{event.title}</h2>
                    <p className="text-sm text-gray-600">{event.date}</p>
                    {event.notes && (
                      <p className="text-gray-700 mt-1">{event.notes}</p>
                    )}
                    {event.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}


      {/* ================== STATS VIEW ================== */}
      {selectedLog && view === "stats" && (
        <div className="w-full flex flex-col items-center bg-white shadow-md rounded-2xl p-4">
          {/* Current log name and back button */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setView("logs")}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2"
              title="Back to log"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold text-blue-700">{selectedLog.name} — Stats</h2>
          </div>
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Search by tag"
            className="w-full border p-2 rounded-xl mb-4"
          />
          {/* ...rest of stats view unchanged... */}
          {/* Show events if searching */}
          {tagQuery && (
            <>
              <h3 className="text-lg font-semibold mb-2">
                Events with #{tagQuery}
              </h3>
              {filteredEvents.length === 0 ? (
                <p className="text-gray-500 text-center">No events found.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {filteredEvents.map((e) => (
                    <div key={e.id} className="border p-2 rounded-xl">
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-sm text-gray-600">{e.date}</p>
                      {e.tags?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Tags: {e.tags.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}


              {/* Show co-tag counts */}
              {Object.keys(coTagCounts).length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">
                    Most Common Tags With #{tagQuery}
                  </h3>
                  <ul className="list-disc list-inside">
                    {Object.entries(coTagCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([tag, count]) => (
                        <li key={tag}>
                          #{tag}: {count} time{count > 1 ? "s" : ""}
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </>
          )}


          {/* Always show overall tag leaderboard */}
          <hr className="my-4" />
          <h3 className="text-lg font-semibold mb-2">Most Common Tags Overall</h3>
          {tagBarData.length === 0 ? (
            <p className="text-gray-500 text-center">No tags added yet.</p>
          ) : (
            <div style={{ width: 600, height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagBarData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="tag" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 8, 8]}>
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}