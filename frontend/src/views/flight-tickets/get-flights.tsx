import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { flareTestnet, sepolia } from "wagmi/chains";
import USDC_LOGO from "../../assets/images/usdc.webp";
import FLARE_LOGO from "../../assets/images/flare.webp";
import PaymentCurrency from "./payments-currency";
import {
  getUSDCFlareAddress,
  getUSDCSepoliaAddress,
} from "../../services/blockchain.services";

// GraphQL Query
const GET_FLIGHTS = gql`
  query MyQuery($first: Int!, $offset: Int!) {
    flightCreateds(orderBy: DATE_DESC, first: $first, offset: $offset) {
      nodes {
        flightId
        route
        date
        amountPaid
      }
      totalCount
    }
  }
`;

const GetFlights = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { loading, error, data } = useQuery(GET_FLIGHTS, {
    fetchPolicy: "cache-and-network",
    variables: { first: pageSize, offset },
    pollInterval: 5000,
  });

  const totalPages = Math.ceil(
    (data?.flightCreateds?.totalCount || 0) / pageSize
  );
  const flights = useMemo(() => data?.flightCreateds?.nodes || [], [data]);

  const goToPage = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<any[]>([]);

  const formatDate = (unixTimestamp: string) => {
    const date = new Date(parseInt(unixTimestamp) * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isFutureFlight = (timestamp: string) => {
    const flightDate = parseInt(timestamp) * 1000;
    return flightDate > Date.now();
  };

  const getUSDC = async () => {
    const sepoliaUSD = await getUSDCSepoliaAddress();
    const flareUSC = await getUSDCFlareAddress();
    return [
      {
        name: "USDC",
        token: sepoliaUSD,
        chainId: sepolia.id,
        blockchain: "ETH",
        logo: USDC_LOGO,
      },
      {
        name: "FLR",
        token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        chainId: flareTestnet.id,
        blockchain: "",
        logo: FLARE_LOGO,
      },
      {
        name: "USDC",
        token: flareUSC,
        chainId: flareTestnet.id,
        blockchain: "FLR",
        logo: USDC_LOGO,
      },
    ];
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      const currencies = await getUSDC();
      setCurrencies(currencies);
    };
    fetchCurrencies();
  }, []);

  if (error) return <p>Error loading tickets: {error.message}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {loading ? (
        <div className="flex justify-center mt-8">
          <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-6 text-blue-700">
            🛫 Available Flights
          </h2>
          <div className="space-y-6">
            {flights.map((flight: any) => {
              const isSelected = selectedFlight === flight.flightId;

              return (
                <div
                  key={flight.flightId}
                  className="rounded-2xl bg-white shadow-md p-6 space-y-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold text-blue-600 truncate flex items-center gap-2">
                      ✈️ <span>{flight.route}</span>
                    </h4>

                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      🗓️{" "}
                      <span className="font-medium">
                        {formatDate(flight.date)}
                      </span>
                    </p>

                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      💰{" "}
                      <span className="font-medium">
                        {flight.amountPaid / 100} USDT
                      </span>
                    </p>

                    <div className="text-xs text-gray-500 break-all">
                      <span className="font-medium">Flight ID:</span>{" "}
                      {flight.flightId}
                    </div>
                  </div>

                  {isFutureFlight(flight.date) && (
                    <div className="pt-4 border-t border-gray-100 mt-2">
                      {!isSelected ? (
                        <button
                          onClick={() => setSelectedFlight(flight.flightId)}
                          className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition w-full sm:w-auto"
                        >
                          Purchase Ticket
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-700 font-medium">
                            Select Currency:
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {currencies.map((cur, idx) => (
                              <PaymentCurrency
                                cur={cur}
                                key={idx}
                                flightId={flight.flightId}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4 mt-10">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>

            <span className="text-gray-800 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GetFlights;
