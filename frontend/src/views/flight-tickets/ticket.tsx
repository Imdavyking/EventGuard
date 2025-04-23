import { toast } from "react-toastify";
import { BACKEND_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import { ellipsify } from "../../utils/ellipsify";
import { FaSpinner } from "react-icons/fa";
import { FDCServiceJson } from "../../services/fdc.json.services";
import {
  refundTicket,
  rethrowFailedResponse,
} from "../../services/blockchain.services";

const Ticket = ({ ticket }: any) => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isGettingProof, setIsGettingProof] = useState(false);
  const [status, setStatus] = useState<any>(null);
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
      console.log("Flight status data:", data);
      setStatus(data.data);
    } catch (error) {
      toast.error(`Error fetching flight status: ${error}`);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getFlightProof = async (flightId: string) => {
    try {
      setIsGettingProof(true);
      const response = await fetch(
        `${BACKEND_URL}/api/fdc/json-proof/${flightId}`
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Flight proof data:", data);

      const fdcService = new FDCServiceJson();
      const proof = await fdcService.getDataAndStoreProof(data.data);

      const refundResponse = await refundTicket({
        flightId: ticket.flightId,
        proof,
      });

      rethrowFailedResponse(refundResponse);

      toast.success("Refund successful!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(`Error fetching flight proof: ${error}`);
      }
    } finally {
      setIsGettingProof(false);
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
      {!status ? (
        <div className="flex justify-center mt-8">
          <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <p
            className={`mt-2 font-medium ${
              ticket.refundStatus === "Refunded"
                ? "text-green-600"
                : "text-yellow-500"
            }`}
          >
            Status: {status.reason_for_delay.description || "Processed"}
          </p>
          <button
            disabled={isCheckingStatus || status.status === "On Time"}
            onClick={async () => {
              await getFlightProof(ticket.flightId);
            }}
            className={`cursor-pointer mt-4 px-4 py-2 rounded-xl text-white w-full ${
              status.status === "On Time" ? "bg-green-600" : "bg-yellow-500"
            }`}
          >
            {isGettingProof ? (
              <div className="flex justify-center">
                <FaSpinner className="w-6 h-6 text-blue-500 animate-spin self-center" />
              </div>
            ) : status.status === "On Time" ? (
              "Flight On Time"
            ) : (
              "Flight Canceled (Refund)"
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default Ticket;
