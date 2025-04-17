import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="p-6 border-b shadow-sm bg-white flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-blue-600">
          🎟️ EventGuard
        </Link>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
          Connect Wallet
        </button>
      </header>

      <main className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-center">
          How EventGuard Works
        </h2>

        <ol className="list-decimal pl-6 space-y-4 text-lg">
          <li>
            <strong>Buy an NFT Ticket:</strong> Users purchase event tickets
            stored as NFTs on-chain.
          </li>
          <li>
            <strong>Monitor Weather via FDC:</strong> EventGuard continuously
            fetches weather data using Flare’s Data Connector.
          </li>
          <li>
            <strong>Trigger Conditions:</strong> If extreme weather conditions
            are detected (e.g., heavy rain, strong wind), a refund is triggered.
          </li>
          <li>
            <strong>Refund in Stablecoin:</strong> The refund value is
            calculated and returned automatically, optionally stabilized using
            FTSO rates.
          </li>
        </ol>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
