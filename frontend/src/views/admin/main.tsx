import { useState, ChangeEvent, FormEvent } from "react";

// Define types for event form and event item
type EventForm = {
  title: string;
  date: string;
  location: string;
  ticketPrice: string;
};

type EventItem = EventForm & {
  id: number;
  status: "Scheduled" | "Refund Triggered";
};

const AdminDashboard = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventForm>({
    title: "",
    date: "",
    location: "",
    ticketPrice: "",
  });

  const handleCreateEvent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newEvent: EventItem = {
      ...form,
      id: events.length + 1,
      status: "Scheduled",
    };
    setEvents([...events, newEvent]);
    setForm({ title: "", date: "", location: "", ticketPrice: "" });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof EventForm
  ) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const simulateRefund = (id: number) => {
    const updated = events.map((ev) =>
      ev.id === id ? { ...ev, status: "Refund Triggered" } : ev
    );
    setEvents(updated as any);
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-6">
        🛠️ Admin / Organizer Dashboard
      </h2>

      {/* Create Event Form */}
      <form
        onSubmit={handleCreateEvent}
        className="bg-white shadow p-6 rounded-xl mb-8"
      >
        <h3 className="text-xl font-semibold mb-4">🎉 Create New Event</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            type="text"
            placeholder="Event Title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={form.title}
            onChange={(e) => handleInputChange(e, "title")}
          />
          <input
            required
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={form.date}
            onChange={(e) => handleInputChange(e, "date")}
          />
          <input
            required
            type="text"
            placeholder="Location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={form.location}
            onChange={(e) => handleInputChange(e, "location")}
          />
          <input
            required
            type="number"
            placeholder="Ticket Price (USDT)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={form.ticketPrice}
            onChange={(e) => handleInputChange(e, "ticketPrice")}
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      </form>

      {/* Event List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="border p-4 rounded-xl bg-white flex justify-between items-center"
          >
            <div>
              <h4 className="font-semibold">{event.title}</h4>
              <p className="text-sm text-gray-600">
                {event.date} • {event.location}
              </p>
              <p className="text-sm text-gray-500">
                Ticket Price: {event.ticketPrice} USDT
              </p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  event.status === "Refund Triggered"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {event.status}
              </span>
            </div>
            <button
              className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
              onClick={() => simulateRefund(event.id)}
            >
              Simulate Refund
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminDashboard;
