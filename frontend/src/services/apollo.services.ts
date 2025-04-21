import { ApolloClient, InMemoryCache } from "@apollo/client";
import { FLIGHT_TICKET_SUBQUERY_ENDPOINT } from "../utils/constants";

const client = new ApolloClient({
  uri: FLIGHT_TICKET_SUBQUERY_ENDPOINT,
  cache: new InMemoryCache(),
});

export default client;
