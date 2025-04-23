import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NavHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="p-6 border-b shadow-sm bg-white flex justify-between items-center mb-6 relative">
      <Link to="/">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
          🎟️ EventGuard
        </h1>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-6">
        <Link
          to="/how-it-works"
          className="text-lg text-gray-700 hover:text-blue-600"
        >
          How It Works
        </Link>
        <Link
          to="/tickets"
          className="text-lg text-gray-700 hover:text-blue-600"
        >
          Tickets
        </Link>
        <Link
          to="/flights"
          className="text-lg text-gray-700 hover:text-blue-600"
        >
          Flights
        </Link>
        <Link to="/admin" className="text-lg text-gray-700 hover:text-blue-600">
          Admin
        </Link>
      </nav>

      {/* Mobile Nav Button */}
      <div className="flex items-center md:hidden space-x-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col space-y-4 p-4 md:hidden z-50">
          <Link
            to="/how-it-works"
            onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-600"
          >
            How It Works
          </Link>
          <Link
            to="/tickets"
            onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-600"
          >
            Tickets
          </Link>
          <Link
            to="/flights"
            onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-600"
          >
            Flights
          </Link>
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="text-gray-700 hover:text-blue-600"
          >
            Admin
          </Link>
        </nav>
      )}

      {/* Always Visible Connect Button */}
      <div className="ml-4">
        <ConnectButton />
      </div>
    </header>
  );
};

export default NavHeader;
