import { toast } from "react-toastify";
import { BACKEND_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import { ellipsify } from "../../utils/ellipsify";

const Ticket = ({ ticket }: any) => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const getFlightStatus = async (flightId: string) => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch(
        `${BACKEND_URL}/api/flight/status/${flightId}`
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }
      const data = await response.json();
      console.log({ data });
    } catch (error) {
      toast.error(`Error fetching flight status: ${error}`);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (!ticket) return;
    if (!ticket.flightId) return;
    getFlightStatus(ticket.flightId);
  }, [ticket]);

  const formatDate = (unix: string | number) => {
    const date = new Date(Number(unix) * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <div
      key={ticket.ticketId}
      className="border p-6 rounded-2xl shadow hover:shadow-lg transition bg-white"
    >
      <h3 className="text-2xl font-semibold">
        Flight {ticket.flightId.slice(0, 6)}...
      </h3>
      <p className="text-sm text-gray-500">
        {formatDate(ticket.date)} • {ticket.route}
      </p>
      <p className="mt-2">Paid: {ticket.amountPaid / 100} USD</p>
      <p className="mt-1 text-xs text-gray-500">
        Payer: {ellipsify(ticket.payer, 12)}
      </p>
      <p
        className={`mt-2 font-medium ${
          ticket.refundStatus === "Refunded"
            ? "text-green-600"
            : "text-yellow-500"
        }`}
      >
        Status: {ticket.refundStatus || "Awaiting Flight Check"}
      </p>
      <button
        disabled
        className={`mt-4 px-4 py-2 rounded-xl text-white w-full ${
          ticket.refundStatus === "Refunded" ? "bg-green-600" : "bg-yellow-500"
        }`}
      >
        {ticket.refundStatus === "Refunded"
          ? "Refund Sent"
          : "Pending Flight Check"}
      </button>
    </div>
  );
};

export default Ticket;
