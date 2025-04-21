import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";

const NavHeader = () => {
  return (
    <header className="p-6 border-b shadow-sm bg-white flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-blue-600">🎟️ EventGuard</h1>
      <nav className="flex space-x-6">
        <Link
          to="/how-it-works"
          className="text-lg text-gray-700 hover:text-blue-600"
        >
          How It Works
        </Link>
        <Link
          to="/flight-tickets"
          className="text-lg text-gray-700 hover:text-blue-600"
        >
          Flight Tickets
        </Link>
        <Link to="/admin" className="text-lg text-gray-700 hover:text-blue-600">
          Admin
        </Link>
      </nav>
      <ConnectButton />
    </header>
  );
};

export default NavHeader;
