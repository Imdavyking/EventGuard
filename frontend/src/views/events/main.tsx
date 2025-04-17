const mockEvents = [
  {
    id: 1,
    title: "Sunset Festival",
    date: "2025-05-12",
    location: "Ibiza Beach",
    description: "Dance by the sea with world-class DJs.",
  },
  {
    id: 2,
    title: "Open Air Cinema",
    date: "2025-06-01",
    location: "Central Park",
    description: "Outdoor movie night with snacks and stars.",
  },
];

const Events = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
      <div className="grid gap-6">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="border p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-2xl font-semibold">{event.title}</h3>
            <p className="text-sm text-gray-500">
              {event.date} • {event.location}
            </p>
            <p className="mt-2">{event.description}</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
              Mint Ticket NFT
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Events;
