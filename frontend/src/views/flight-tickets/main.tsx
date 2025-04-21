const mockFlights = [
  {
    id: "1",
    flightNumber: "EK202",
    route: "New York (JFK) → Dubai (DXB)",
    date: "2025-05-12",
    weatherCondition: "Heavy Rain (18mm)",
    refundStatus: "Refunded",
  },
  {
    id: "2",
    flightNumber: "BA178",
    route: "New York (JFK) → London (LHR)",
    date: "2025-06-01",
    weatherCondition: "Clear",
    refundStatus: "Awaiting Weather Check",
  },
];

const FlightsTickets = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Your Flights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockFlights.map((flight) => (
          <div
            key={flight.id}
            className="border p-6 rounded-2xl shadow hover:shadow-lg transition bg-white"
          >
            <h3 className="text-2xl font-semibold">
              Flight {flight.flightNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {flight.date} • {flight.route}
            </p>
            <p className="mt-2">
              Weather on Departure: {flight.weatherCondition}
            </p>
            <p
              className={`mt-1 font-medium ${
                flight.refundStatus === "Refunded"
                  ? "text-green-600"
                  : "text-yellow-500"
              }`}
            >
              Status: {flight.refundStatus}
            </p>
            <button
              disabled
              className={`mt-4 px-4 py-2 rounded-xl text-white w-full ${
                flight.refundStatus === "Refunded"
                  ? "bg-green-600"
                  : "bg-yellow-500"
              }`}
            >
              {flight.refundStatus === "Refunded"
                ? "Refund Sent"
                : "Pending Weather Check"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default FlightsTickets;
