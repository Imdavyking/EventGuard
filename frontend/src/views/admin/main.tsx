import { useState, ChangeEvent, FormEvent } from "react";
import {
  createFlight,
  rethrowFailedResponse,
} from "../../utils/blockchain.services";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import GetFlights from "../flight-tickets/get-flights";

// Define types for event form and event item
type EventForm = {
  title: string;
  date: string;
  location: string;
  ticketPrice: string;
};

const AdminDashboard = () => {
  const [form, setForm] = useState<EventForm>({
    title: "",
    date: "",
    location: "",
    ticketPrice: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await createFlight({
        route: form.location,
        date: new Date(form.date).getTime() / 1000,
        amountInUsd: +form.ticketPrice * 100,
      });
      rethrowFailedResponse(response);
      toast.success("Event created successfully!");

      setForm({ title: "", date: "", location: "", ticketPrice: "" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create event");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof EventForm
  ) => {
    setForm({ ...form, [field]: e.target.value });
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
            placeholder="Ticket Price (USD)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={form.ticketPrice}
            onChange={(e) => handleInputChange(e, "ticketPrice")}
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            "Create Event"
          )}
        </button>
      </form>
    </>
  );
};

export default AdminDashboard;
