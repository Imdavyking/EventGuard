import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useMemo } from "react";

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

  const goToPage = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const flights = useMemo(() => {
    return data?.flightCreateds?.nodes || [];
  }, [data]);

  const formatDate = (unixTimestamp: string) => {
    const date = new Date(parseInt(unixTimestamp) * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {loading ? (
        <div className="flex justify-center mt-8">
          <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-6">🛫 Available Flights</h2>

          <div className="space-y-4">
            {flights.map((flight: any) => (
              <div
                key={flight.flightId}
                className="border p-4 rounded-xl bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg text-blue-600">
                      ✈️ {flight.route}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Date: {formatDate(flight.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Price Paid:{" "}
                      <span className="font-medium">
                        {flight.amountPaid / 100} USDT
                      </span>
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 break-all text-right w-1/2">
                    <p>Flight ID:</p>
                    <p>{flight.flightId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-4 mt-8">
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
