import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 text-gray-800">
      <main className="px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Decentralized Ticket Refunds
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Flight Delay Refunds, powered by real-time weather data from Flare's
          Data Connector (FDC).
        </p>

        <Link
          to="/how-it-works"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Learn How It Works
        </Link>
      </main>

      <footer className="p-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} EventGuard • Built with Flare FDC & FTSO
      </footer>
    </div>
  );
}

export default Home;
