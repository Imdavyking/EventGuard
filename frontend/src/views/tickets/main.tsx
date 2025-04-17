const mockMyTickets = [
  {
    id: "ticket-1",
    event: "Sunset Festival",
    date: "2025-05-12",
    location: "Ibiza Beach",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ticket-2",
    event: "Open Air Cinema",
    date: "2025-06-01",
    location: "Central Park",
    status: "Refunded",
    image:
      "https://images.unsplash.com/photo-1526662092594-e98c1e356d6f?auto=format&fit=crop&w=800&q=80",
  },
];

const MyTickets = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">🎟️ My Tickets</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {mockMyTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={ticket.image}
              alt={ticket.event}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold">{ticket.event}</h3>
              <p className="text-sm text-gray-500">
                {ticket.date} • {ticket.location}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                  ticket.status === "Refunded"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyTickets;
