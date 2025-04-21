import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

import * as dotenv from "dotenv";
import { cleanDB } from "./src/utils/clean";

cleanDB();

dotenv.config();

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "SubQuery Project",
  description:
    "This project can be use as a starting point for developing your SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Creator Testnet this is 66665
     * https://chainlist.org/chain/66665
     */
    chainId: process.env.CHAIN_ID!,
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: process.env.RPC_URL!?.split(",") as string[] | string,
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: +process.env.BLOCK_NUMBER!,
      options: {
        abi: "Abi",
        address: process.env.FLIGHT_TICKET_CONTRACT_ADDRESS!,
      },
      assets: new Map([["Abi", { file: "./abis/flight-ticket.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleFlightCreatedLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: ["FlightCreated(uint256,string,uint256,uint256)"],
            },
          },
          {
            handler: "handleFlightTicketPurchasedLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: [
                "FlightTicketPurchased(uint256,string,uint256,string,string,uint256,address)",
              ],
            },
          },
          {
            handler: "handleFlightTicketWithdrawnLog",
            kind: EthereumHandlerKind.Event,
            filter: {
              topics: [
                "FlightTicketWithdrawn(uint256,uint256,string,uint256,string,string,uint256,address)",
              ],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/Imdavyking",
};

// Must set default to the project instance
export default project;
