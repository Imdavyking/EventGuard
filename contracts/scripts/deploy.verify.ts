import hre, { ethers } from "hardhat";
import { verify } from "../utils/verify";
import dotenv from "dotenv";
import { network } from "hardhat";
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core";
import { cleanDeployments } from "../utils/clean";
import { updateEnv } from "./update.env";
import { copyABI } from "./copy.abi";
import { localHardhat } from "../utils/localhardhat.chainid";
import FlightModule from "../ignition/modules/FlightModule";

dotenv.config();

async function main() {
  const chainId = network.config.chainId!;

  cleanDeployments(chainId!);

  const { flightTicket } = await hre.ignition.deploy(FlightModule);
  await flightTicket.waitForDeployment();
  const flightTicketAddress = await flightTicket.getAddress();

  console.log("FlightTicket deployed to:", flightTicketAddress);

  await verify(flightTicketAddress, []);

  updateEnv(flightTicketAddress, "frontend", "VITE_CONTRACT_ADDRESS");
  copyABI("FlightTicket", "frontend/src/assets/json", "flightTicket");
}

main().catch(console.error);
