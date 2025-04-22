import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ellipsify } from "../../utils/ellipsify";
import { FaSpinner } from "react-icons/fa";
import { getSigner } from "../../utils/blockchain.services";

const GET_FLIGHTS = gql`
  query MyQuery($first: Int!, $offset: Int!, $equalTo: String!) {
    flightTicketPurchaseds(
      orderBy: DATE_DESC
      first: $first
      offset: $offset
      filter: { payer: { equalTo: $equalTo } }
    ) {
      nodes {
        flightId
        ticketId
        refundStatus
        amountPaid
        route
        date
        payer
      }
      totalCount
    }
  }
`;

const FlightsTickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const getAddress = async () => {
      const signer = await getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
    };

    getAddress();
  }, []);

  // Only run the query once the userAddress is available
  const { loading, error, data } = useQuery(GET_FLIGHTS, {
    skip: !userAddress, // Skip query until userAddress is available
    fetchPolicy: "cache-and-network",
    variables: { first: pageSize, offset, equalTo: userAddress || "" },
    pollInterval: 5000,
  });

  const flights = useMemo(
    () => data?.flightTicketPurchaseds?.nodes || [],
    [data]
  );
  const totalPages = Math.ceil(
    (data?.flightTicketPurchaseds?.totalCount || 0) / pageSize
  );

  const goToPage = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const formatDate = (unix: string | number) => {
    const date = new Date(Number(unix) * 1000);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center mt-8">
        <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  if (error) return <p>Error loading tickets: {error.message}</p>;

  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Your Tickets</h2>

      {flights.length === 0 ? (
        <p className="text-gray-600">No tickets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight: any, idx: number) => (
            <div
              key={flight.ticketId || idx}
              className="border p-6 rounded-2xl shadow hover:shadow-lg transition bg-white"
            >
              <h3 className="text-2xl font-semibold">
                Flight {flight.flightId.slice(0, 6)}...
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(flight.date)} • {flight.route}
              </p>
              <p className="mt-2">Paid: {flight.amountPaid / 100} USD</p>
              <p className="mt-1 text-xs text-gray-500">
                Payer: {ellipsify(flight.payer, 12)}
              </p>
              <p
                className={`mt-2 font-medium ${
                  flight.refundStatus === "Refunded"
                    ? "text-green-600"
                    : "text-yellow-500"
                }`}
              >
                Status: {flight.refundStatus || "Awaiting Weather Check"}
              </p>
              <button
                disabled
                className={`mt-4 px-4 py-2 rounded-xl text-white w-full ${
                  flight.refundStatus === "Refunded"
                    ? "bg-green-600"
                    : "bg-yellow-500"
                }`}
              >
                {flight.refundStatus === "Refunded"
                  ? "Refund Sent"
                  : "Pending Weather Check"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-10">
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>

        <span className="text-gray-800 font-medium">
          Page {page} of {totalPages || 1}
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
  );
};

export default FlightsTickets;
