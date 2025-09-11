import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
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
  const [view, setView] = useState("logs"); // "logs" | "stats"
  const [tagQuery, setTagQuery] = useState("");
  const eventFormRef = useRef(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCreateLogModal, setShowCreateLogModal] = useState(false);
  const [newLogName, setNewLogName] = useState("");


  // Load logs in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "logs"), (snapshot) => {
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Load events for selected log in real-time
  useEffect(() => {
    if (!selectedLog) return setEvents([]);
    const eventsRef = collection(db, "logs", selectedLog.id, "events");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedLog?.id]);

  async function handleCreateLog() {
    if (!newLogName.trim()) return;
    await addDoc(collection(db, "logs"), { name: newLogName.trim() });
    setNewLogName("");
    setShowCreateLogModal(false);
  }


  async function handleDeleteLog(logId) {
    const eventsRef = collection(db, "logs", logId, "events");
    const snapshot = await getDocs(eventsRef);
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, "logs", logId));
    if (selectedLog?.id === logId) setSelectedLog(null);
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    await addDoc(collection(db, "logs", selectedLog.id, "events"), {
      title: form.title,
      date: form.date,
      notes: form.notes,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setForm({ title: "", date: "", notes: "", tags: "" });
  }

  async function handleDeleteEvent(eventId) {
    await deleteDoc(doc(db, "logs", selectedLog.id, "events", eventId));
  }

  const filteredEvents = tagQuery
    ? events.filter((e) => e.tags?.includes(tagQuery))
    : events;

  const tagCounts = {};
  events.forEach((e) => e.tags?.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));

  const coTagCounts = {};
  if (tagQuery) {
    filteredEvents.forEach((e) =>
      e.tags?.forEach((t) => {
        if (t !== tagQuery) coTagCounts[t] = (coTagCounts[t] || 0) + 1;
      })
    );
  }

  const tagBarData = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center relative pb-24">
      {/* Home Icon */}
      <button
        className="absolute top-4 left-4 text-2xl hover:scale-110 transition"
        onClick={() => setSelectedLog(null)}
        title="Go Home"
      >
        📔
      </button>

      {/* Title / Hero Section */}
      <h1 className="text-5xl font-extrabold mt-10 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md">
        Memz
      </h1>

      {/* Add Log */}
      {showCreateLogModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Create New Log</h2>
            <input
              type="text"
              placeholder="Enter log name..."
              value={newLogName}
              onChange={(e) => setNewLogName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateLogModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLog}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold hover:opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}


      {!selectedLog && (
        <div className="text-center max-w-md w-full">
          <p className="text-xl text-gray-300 mb-6">
            Welcome to Memz! Your digital diary awaits 📖
          </p>

          {logs.length === 0 ? (
            <p className="text-gray-500 mb-12">
              Create your first log and start capturing memories.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 mb-8 px-2">
              {logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => {
                    setSelectedLog(log);
                    setView("logs");
                  }}
                  className="relative flex flex-col items-center justify-center bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-lg hover:scale-105 transition mb-4"
                  style={{ minHeight: '140px' }}
                >
                  <div className="text-4xl mb-3">📄</div>
                  <span className="font-semibold text-lg mb-2">{log.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${log.name}"?`)) {
                        handleDeleteLog(log.id);
                      }
                    }}
                    className="absolute top-2 right-4 text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log View */}
      {selectedLog && view === "logs" && (
        <div className="max-w-md w-full mt-10 mb-10 px-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{selectedLog.name}</h2>
            <button
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              onClick={() => setView("stats")}
            >
              📊 Stats
            </button>
          </div>

          {/* Show Add Event Button or Form */}
          {!showEventForm ? (
            <div className="flex justify-center mb-8">
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:scale-105 transition"
                onClick={() => setShowEventForm(true)}
              >
                <span className="text-2xl">＋</span> Add Event
              </button>
            </div>
          ) : (
            <form
              ref={eventFormRef}
              onSubmit={async (e) => {
                await handleAddEvent(e);
                setShowEventForm(false);
              }}
              className="bg-gray-800 rounded-2xl shadow-lg p-6 space-y-5 mb-8 border border-purple-700/30 relative animate-fade-in"
            >
              <button
                type="button"
                className="absolute top-3 right-4 text-gray-400 hover:text-red-400 text-2xl"
                onClick={() => setShowEventForm(false)}
                title="Cancel"
              >
                ×
              </button>
              <div className="flex flex-col gap-2">
                <label className="text-left text-sm text-purple-200 font-semibold">Event Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Event Title"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-left text-sm text-purple-200 font-semibold">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-left text-sm text-purple-200 font-semibold">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-left text-sm text-purple-200 font-semibold">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-3 rounded-lg font-semibold hover:opacity-90 mt-2">
                Add Event
              </button>
            </form>
          )}

          {/* Events */}
          <div className="space-y-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800 rounded-xl p-5 shadow-md flex justify-between items-start mb-2"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-1">{event.date}</p>
                  {event.notes && <p className="mb-2">{event.notes}</p>}
                  {event.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-purple-700/30 text-purple-300 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-red-400 hover:text-red-600 ml-4 mt-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats View */}
      {selectedLog && view === "stats" && (
        <div className="max-w-md w-full mt-6 bg-gray-800 rounded-xl p-4">
          <button
            onClick={() => setView("logs")}
            className="text-gray-400 hover:text-gray-200 mb-4"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold mb-4">{selectedLog.name} — Stats</h2>
          <input
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Search by tag"
            className="w-full p-2 mb-4 rounded-lg bg-gray-700 text-white"
          />
          {/* Co-tag counts for searched tag */}
          {tagQuery && Object.keys(coTagCounts).length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Most Common Tags With #{tagQuery}</h3>
              <ul className="list-disc list-inside text-purple-200">
                {Object.entries(coTagCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tag, count]) => (
                    <li key={tag}>
                      #{tag}: {count} time{count > 1 ? "s" : ""}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {tagBarData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="tag" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#a78bfa">
                  <LabelList dataKey="count" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Floating Action Button (hide in log and stats view) */}
      {!selectedLog && (
        <button
          onClick={() => setShowCreateLogModal(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition"
        >
          +
        </button>
      )}

      {/* Bottom Navigation */}
      {selectedLog && (
        <div className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 flex justify-around py-3">
          <button
            className={`flex flex-col items-center ${view === "logs" ? "text-purple-400" : "text-gray-400"
              }`}
            onClick={() => setView("logs")}
          >
            📄
            <span className="text-xs">Logs</span>
          </button>
          <button
            className={`flex flex-col items-center ${view === "stats" ? "text-purple-400" : "text-gray-400"
              }`}
            onClick={() => setView("stats")}
          >
            📊
            <span className="text-xs">Stats</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600 cursor-not-allowed"
            disabled
          >
            📅
            <span className="text-xs">Calendar</span>
          </button>
        </div>
      )}
    </div>
  );
}