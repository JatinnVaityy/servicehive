import { useState, useEffect } from "react";
import api from "../api/axios";
import { SWAP_STATUS } from "../utils/enums";
import { toast } from "react-toastify";

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [inRes, outRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing")
      ]);
      setIncoming(inRes.data);
      setOutgoing(outRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch requests");
      toast.error(err.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, accept) => {
    try {
      await api.post(`/swap-response/${id}`, { accept });
      toast.success(accept ? "Swap request accepted" : "Swap request rejected");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to respond");
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <p className="text-center mt-4">Loading requests...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
        {incoming.length === 0 ? <p>No incoming requests</p> : incoming.map(r => (
          <div key={r._id} className="border p-2 rounded mb-2">
            <p>{r.requester?.name || "User"} wants to swap <b>{r.mySlot?.title || "Unknown"}</b> for your <b>{r.theirSlot?.title || "Unknown"}</b></p>
            <div className="flex gap-2 mt-2">
              <button
                disabled={r.status !== SWAP_STATUS.PENDING}
                onClick={() => respond(r._id, true)}
                className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Accept
              </button>
              <button
                disabled={r.status !== SWAP_STATUS.PENDING}
                onClick={() => respond(r._id, false)}
                className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-semibold mb-3">Outgoing Requests</h3>
        {outgoing.length === 0 ? <p>No outgoing requests</p> : outgoing.map(r => (
          <div key={r._id} className="border p-2 rounded mb-2">
            <p>You offered <b>{r.mySlot?.title || "Unknown"}</b> for <b>{r.theirSlot?.title || "Unknown"}</b></p>
            <p className="text-sm text-gray-600">Status: {r.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
