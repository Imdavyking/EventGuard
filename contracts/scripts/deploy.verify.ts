import hre from "hardhat";
import { verify } from "../utils/verify";
import dotenv from "dotenv";
import { network } from "hardhat";
import { cleanDeployments } from "../utils/clean";
import { updateEnv } from "./update.env";
import FlightModule from "../ignition/modules/FlightModule";

import { copyABI } from "./copy.abi";
import HelpersModule from "../ignition/modules/Helpers";

dotenv.config();

async function main() {
  // const chainId = network.config.chainId!;
  // const rpcUrl = (network.config as any).url;
  // cleanDeployments(chainId!);
  // const blockNumber = await hre.ethers.provider.getBlockNumber();
  // const { flightTicket } = await hre.ignition.deploy(FlightModule);
  // const { helpers } = await hre.ignition.deploy(HelpersModule);
  // await flightTicket.waitForDeployment();
  // await helpers.waitForDeployment();
  // const flightTicketAddress = await flightTicket.getAddress();
  // const helpersAddress = await helpers.getAddress();

  // console.log("FlightTicket deployed to:", flightTicketAddress);
  // console.log("Helpers deployed to:", helpersAddress);

  // await verify(flightTicketAddress, []);
  // await verify(helpersAddress, []);

  // updateEnv(
  //   flightTicketAddress,
  //   "frontend",
  //   "VITE_FLIGHT_TICKET_CONTRACT_ADDRESS"
  // );
  // updateEnv(helpersAddress, "frontend", "VITE_FDC_HELPER_ADDRESS");
  // updateEnv(flightTicketAddress, "indexer", "FLIGHT_TICKET_CONTRACT_ADDRESS");
  // updateEnv(blockNumber.toString(), "indexer", "BLOCK_NUMBER");
  // updateEnv(chainId!.toString()!, "indexer", "CHAIN_ID");
  // updateEnv(rpcUrl, "indexer", "RPC_URL");
  // copyABI("FlightTicket", "indexer/abis", "flight-ticket");
  // copyABI("FlightTicket", "frontend/src/assets/json", "flight-ticket");
  copyABI("Helpers", "frontend/src/assets/json", "helpers-fdc");
}

main().catch(console.error);
