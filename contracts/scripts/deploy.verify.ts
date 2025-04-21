import hre from "hardhat";
import { verify } from "../utils/verify";
import dotenv from "dotenv";
import { network } from "hardhat";
import { cleanDeployments } from "../utils/clean";
import { updateEnv } from "./update.env";
import FlightModule from "../ignition/modules/FlightModule";
import codeTypeChainFolder from "./copy.folder";

dotenv.config();

async function main() {
  const chainId = network.config.chainId!;

  cleanDeployments(chainId!);

  const { flightTicket } = await hre.ignition.deploy(FlightModule);
  await flightTicket.waitForDeployment();
  const flightTicketAddress = await flightTicket.getAddress();

  console.log("FlightTicket deployed to:", flightTicketAddress);

  await verify(flightTicketAddress, []);

  updateEnv(
    flightTicketAddress,
    "frontend",
    "VITE_FLIGHT_TICKET_CONTRACT_ADDRESS"
  );
  codeTypeChainFolder("frontend/src/typechain-types");
}

main().catch(console.error);
