import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useMemo, useState } from "react";
import {
  payForFlight,
  rethrowFailedResponse,
} from "../../utils/blockchain.services";
import { toast } from "react-toastify";

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
  const [isPaying, setIsPaying] = useState(false);
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
  const [selectedCurrency, setSelectedCurrency] = useState<{
    [key: string]: {
      token: string;
      name: string;
    };
  }>({});

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

  const currencies = [
    {
      name: "USDT",
      token: "0x55d398326f99059ff775485246999027b3197955",
    },
    {
      name: "FLR",
      token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    },
  ];

  const handleCurrencySelect = async (
    flightId: string,
    currency: {
      token: string;
      name: string;
    }
  ) => {
    setSelectedCurrency((prev) => ({ ...prev, [flightId]: currency }));
    try {
      setIsPaying(true);
      const response = await payForFlight({
        flightId: flightId,
        token: currency.token,
      });
      rethrowFailedResponse(response);
      toast.success(
        `Successfully purchased ticket for flight ${flightId} with ${currency.name}`
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while processing your request.");
      }
    } finally {
      setIsPaying(false);
    }
  };

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

          <div className="space-y-5">
            {flights.map((flight: any) => {
              const isSelected = selectedFlight === flight.flightId;

              return (
                <div
                  key={flight.flightId}
                  className="border rounded-xl bg-white shadow-md p-6 space-y-4 flex flex-col sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <h4 className="text-xl font-semibold text-blue-600 truncate">
                      ✈️ {flight.route}
                    </h4>

                    <p className="text-sm text-gray-600">
                      🗓️ Date:{" "}
                      <span className="font-medium">
                        {formatDate(flight.date)}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      💰 Price Paid:{" "}
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
                    <div className="pt-4 sm:pt-0 sm:pl-6 flex-shrink-0 space-y-4">
                      {!isSelected ? (
                        <button
                          onClick={() => setSelectedFlight(flight.flightId)}
                          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer w-full sm:w-auto"
                        >
                          Purchase Ticket
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <label className="block text-sm text-gray-700 font-medium">
                            Select Currency:
                          </label>
                          <div className="flex gap-4">
                            {currencies.map((cur) => (
                              <button
                                key={cur.token}
                                onClick={() =>
                                  handleCurrencySelect(flight.flightId, cur)
                                }
                                className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border hover:bg-blue-100 transition ${
                                  selectedCurrency[flight.flightId] === cur
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700"
                                }`}
                              >
                                {isPaying ? (
                                  <FaSpinner className="w-4 h-4 animate-spin" />
                                ) : (
                                  cur.name
                                )}
                              </button>
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
