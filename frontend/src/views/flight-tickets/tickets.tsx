import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { getSigner } from "../../services/blockchain.services";
import Ticket from "./ticket";

const GET_TICKETS = gql`
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

const Tickets = () => {
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
  const { loading, error, data } = useQuery(GET_TICKETS, {
    skip: !userAddress, // Skip query until userAddress is available
    fetchPolicy: "cache-and-network",
    variables: { first: pageSize, offset, equalTo: userAddress || "" },
    pollInterval: 5000,
  });

  const tickets = useMemo(
    () => data?.flightTicketPurchaseds?.nodes || [],
    [data]
  );
  const totalPages = Math.ceil(
    (data?.flightTicketPurchaseds?.totalCount || 0) / pageSize
  );

  const goToPage = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
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

      {tickets.length === 0 ? (
        <p className="text-gray-600">No tickets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket: any, idx: number) => (
            <Ticket key={idx} ticket={ticket} />
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

export default Tickets;
