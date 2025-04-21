import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 py-4">
      <main className="max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-10 text-blue-700">
          How EventGuard Works
        </h2>

        <ol className="list-decimal pl-6 space-y-6 text-lg leading-relaxed">
          <li>
            <strong className="text-gray-900">Buy a Ticket:</strong> Users
            purchase event tickets stored on-chain.
          </li>
          <li>
            <strong className="text-gray-900">Monitor Weather via FDC:</strong>{" "}
            EventGuard continuously fetches weather data using Flare's Data
            Connector.
          </li>
          <li>
            <strong className="text-gray-900">Trigger Conditions:</strong> If
            extreme weather conditions are detected (e.g., heavy rain, strong
            wind), a refund is triggered.
          </li>
          <li>
            <strong className="text-gray-900">Refund in Stablecoin:</strong> The
            refund value is calculated and returned automatically, optionally
            stabilized using FTSO rates.
          </li>
        </ol>

        <div className="mt-14">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
