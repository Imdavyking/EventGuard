import { FaSpinner } from "react-icons/fa";
import {
  payForFlight,
  rethrowFailedResponse,
  sepoliaUSDCPayAndProof,
} from "../../services/blockchain.services";
import { toast } from "react-toastify";
import { flareTestnet } from "wagmi/chains";
import { useState } from "react";

const PaymentCurrency = ({
  cur,
  flightId,
}: {
  cur: {
    token: string;
    name: string;
    logo: string;
    blockchain: string;
    chainId: number;
  };
  flightId: string;
}) => {
  const [isPaying, setIsPaying] = useState(false);

  const handleCurrencySelect = async () => {
    try {
      setIsPaying(true);

      if (cur.chainId === flareTestnet.id) {
        const response = await payForFlight({
          flightId,
          token: cur.token,
        });
        rethrowFailedResponse(response);
      } else {
        const response = await sepoliaUSDCPayAndProof(flightId);
        if (response) {
          rethrowFailedResponse(response);
          console.log({ response });
        }
      }

      toast.success(
        `Successfully purchased ticket for flight ${flightId} with ${cur.name}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <button
      onClick={handleCurrencySelect}
      disabled={isPaying}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition duration-200
        ${
          isPaying
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-blue-50 text-gray-800"
        }`}
      aria-label={`Pay with ${cur.name}`}
    >
      {isPaying ? (
        <FaSpinner className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <img
            src={cur.logo}
            alt={`${cur.name} logo`}
            className="w-5 h-5"
            loading="lazy"
          />
          <span className="font-medium text-sm">
            {cur.name}
            {cur.blockchain?.trim() && ` (${cur.blockchain})`}
          </span>
        </>
      )}
    </button>
  );
};

export default PaymentCurrency;
