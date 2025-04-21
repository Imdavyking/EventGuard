import { gql, useQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
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

  return (
    <>
      {loading ? (
        <FaSpinner className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {" "}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>

            <span className="text-white">
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
    </>
  );
  //     {events.map((event) => (
  //       <div
  //         key={event.id}
  //         className="border p-4 rounded-xl bg-white flex justify-between items-center"
  //       >
  //         <div>
  //           <h4 className="font-semibold">{event.title}</h4>
  //           <p className="text-sm text-gray-600">
  //             {event.date} • {event.location}
  //           </p>
  //           <p className="text-sm text-gray-500">
  //             Ticket Price: {event.ticketPrice} USDT
  //           </p>
  //           <span
  //             className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
  //               event.status === "Refund Triggered"
  //                 ? "bg-red-100 text-red-600"
  //                 : "bg-green-100 text-green-600"
  //             }`}
  //           >
  //             {event.status}
  //           </span>
  //         </div>
  //         <button
  //           className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
  //           onClick={() => simulateRefund(event.id)}
  //         >
  //           Simulate Refund
  //         </button>
  //       </div>
  //     ))}
  //   </div>;
};


export default GetFlights;