import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useMemo } from "react";

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

  if (error) {
    console.error("Error fetching flights:", error);
    return <div>{error.message}</div>;
  }

  const totalPages = Math.ceil(
    (data?.flightCreateds?.totalCount || 0) / pageSize
  );
  const flights = useMemo(() => data?.flightCreateds?.nodes || [], [data]);

  const goToPage = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

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
            {flights.map((flight: any) => (
              <div
                key={flight.flightId}
                className="border rounded-xl bg-white shadow-md p-6 space-y-2"
              >
                <h4 className="text-xl font-semibold text-blue-600 truncate">
                  ✈️ {flight.route}
                </h4>

                <p className="text-sm text-gray-600">
                  🗓️ Date:{" "}
                  <span className="font-medium">{formatDate(flight.date)}</span>
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

                {isFutureFlight(flight.date) && (
                  <div className="pt-4">
                    <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer">
                      Purchase Ticket
                    </button>
                  </div>
                )}
              </div>
            ))}
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
