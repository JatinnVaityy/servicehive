import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Marketplace() {
  const [slots, setSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [swappableRes, myEventsRes] = await Promise.all([
        api.get("/swappable-slots"),
        api.get("/events")
      ]);
      setSlots(swappableRes.data);
      setMySlots(myEventsRes.data.filter(e => e.status === "SWAPPABLE"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const requestSwap = async (theirSlotId, mySlotId, selectEl) => {
    if (!mySlotId || mySlotId === "select") return;
    try {
      await api.post("/swap-request", { theirSlotId, mySlotId });
      toast.success("Swap request sent!");
      fetchData();
      if (selectEl) selectEl.value = "select";
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send swap request");
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Available Swappable Slots</h2>
      {slots.length === 0 ? (
        <p>No available slots.</p>
      ) : (
        <ul className="space-y-2">
          {slots.map(slot => (
            <li key={slot._id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{slot.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Owner: {slot.owner?.name || "User"}</p>
              </div>
              <select
                defaultValue="select"
                onChange={e => requestSwap(slot._id, e.target.value, e.target)}
                className="border p-1 rounded"
              >
                <option value="select">Select My Slot</option>
                {mySlots.length === 0 && <option disabled>No swappable slots</option>}
                {mySlots.map(ms => (
                  <option key={ms._id} value={ms._id}>{ms.title}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
