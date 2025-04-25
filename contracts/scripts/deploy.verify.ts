import hre from "hardhat";
import { verify } from "../utils/verify";
import dotenv from "dotenv";
import { network } from "hardhat";
import { cleanDeployments } from "../utils/clean";
import { updateEnv } from "./update.env";
import FlightModule from "../ignition/modules/FlightModule";

import { copyABI } from "./copy.abi";
import HelpersModule from "../ignition/modules/Helpers";
import USDCModule from "../ignition/modules/USDC";

dotenv.config();

async function main() {
  const chainId = network.config.chainId!;
  const rpcUrl = (network.config as any).url;
  cleanDeployments(chainId!);
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  const { flightTicket } = await hre.ignition.deploy(FlightModule);
  const { helpers } = await hre.ignition.deploy(HelpersModule);
  const { usdc } = await hre.ignition.deploy(USDCModule);
  await flightTicket.waitForDeployment();
  await helpers.waitForDeployment();
  await usdc.waitForDeployment();
  const flightTicketAddress = await flightTicket.getAddress();
  const helpersAddress = await helpers.getAddress();
  const usdcAddress = await usdc.getAddress();

  console.log("FlightTicket deployed to:", flightTicketAddress);
  console.log("Helpers deployed to:", helpersAddress);
  console.log("USDC deployed to:", usdcAddress);

  // set url
  const flightContract = await hre.ethers.getContractAt(
    "FlightTicket",
    flightTicketAddress
  );

  const tx = await flightContract.setHostName(process.env.BACKEND_URL!);
  await tx.wait(1);

  const usdcSet = await flightContract.setUSDCFlareContract(usdcAddress);
  await usdcSet.wait(1);

  // sepolia
  await hre.changeNetwork("sepolia");
  const [wallet] = await hre.ethers.getSigners();
  const usdcSepoliaFactory = await hre.ethers.getContractFactory(
    "USDC",
    wallet
  );
  const usdcSepolia = await usdcSepoliaFactory.deploy();
  await usdcSepolia.waitForDeployment();
  const usdcSepoliaAddress = await usdcSepolia.getAddress();
  console.log("USDC Sepolia deployed to:", usdcSepoliaAddress);
  await hre.changeNetwork("coston2");

  const setUSDCSepolia = await flightContract.setUSDCSepoliaContract(
    usdcSepoliaAddress
  );
  await setUSDCSepolia.wait(1);

  await verify(flightTicketAddress, []);
  await verify(helpersAddress, []);
  await verify(usdcAddress, []);

  updateEnv(
    flightTicketAddress,
    "frontend",
    "VITE_FLIGHT_TICKET_CONTRACT_ADDRESS"
  );
  updateEnv(flightTicketAddress, "backend", "FLIGHT_TICKET_CONTRACT_ADDRESS");
  updateEnv(flightTicketAddress, "indexer", "FLIGHT_TICKET_CONTRACT_ADDRESS");
  updateEnv(helpersAddress, "frontend", "VITE_FDC_HELPER_ADDRESS");
  updateEnv(blockNumber.toString(), "indexer", "BLOCK_NUMBER");
  updateEnv(chainId!.toString()!, "indexer", "CHAIN_ID");
  updateEnv(rpcUrl, "indexer", "RPC_URL");
  updateEnv(rpcUrl, "backend", "RPC_URL");
  copyABI("FlightTicket", "indexer/abis", "flight-ticket");
  copyABI("FlightTicket", "frontend/src/assets/json", "flight-ticket");
  copyABI("Helpers", "frontend/src/assets/json", "helpers-fdc");
  copyABI("USDC", "frontend/src/assets/json", "erc20");
}

main().catch(console.error);
