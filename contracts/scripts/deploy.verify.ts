import hre from "hardhat";
import { verify } from "../utils/verify";
import dotenv from "dotenv";
import { network } from "hardhat";
import { cleanDeployments } from "../utils/clean";
import { updateEnv } from "./update.env";
import FlightModule from "../ignition/modules/FlightModule";
import codeTypeChainFolder from "./copy.folder";
import { copyABI } from "./copy.abi";

dotenv.config();

async function main() {
  const chainId = network.config.chainId!;
  const rpcUrl = (network.config as any).url;
  cleanDeployments(chainId!);
  const blockNumber = await hre.ethers.provider.getBlockNumber();
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
  updateEnv(flightTicketAddress, "indexer", "FLIGHT_TICKET_CONTRACT_ADDRESS");
  updateEnv(blockNumber.toString(), "indexer", "BLOCK_NUMBER");
  updateEnv(chainId!.toString()!, "indexer", "CHAIN_ID");
  updateEnv(rpcUrl, "indexer", "RPC_URL");
  codeTypeChainFolder("frontend/src/typechain-types");
  copyABI("FlightTicket", "indexer/abis", "flight-ticket");
}

main().catch(console.error);
