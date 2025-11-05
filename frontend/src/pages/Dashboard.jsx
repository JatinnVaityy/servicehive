import { useState, useEffect } from "react";
import api from "../api/axios";
import { EVENT_STATUS } from "../utils/enums"; // ✅ import here

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "" });

  const fetchEvents = async () => {
    const res = await api.get("/events");
    setEvents(res.data);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    await api.post("/events", form);
    setForm({ title: "", startTime: "", endTime: "" });
    fetchEvents();
  };

  const makeSwappable = async (id) => {
    await api.put(`/events/${id}`, { status: EVENT_STATUS.SWAPPABLE });
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Events</h2>

      <form onSubmit={createEvent} className="flex flex-col gap-3 mb-4">
        <input
          placeholder="Title"
          className="border p-2 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />
        <button className="bg-indigo-600 text-white p-2 rounded">Add Event</button>
      </form>

      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e._id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(e.startTime).toLocaleString()} - {new Date(e.endTime).toLocaleString()}
              </p>
              <p
                className={`text-xs font-semibold mt-1 ${
                  e.status === EVENT_STATUS.SWAPPABLE
                    ? "text-green-600"
                    : e.status === EVENT_STATUS.SWAP_PENDING
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {e.status}
              </p>
            </div>

            {e.status === EVENT_STATUS.BUSY && (
              <button
                onClick={() => makeSwappable(e._id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Make Swappable
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
