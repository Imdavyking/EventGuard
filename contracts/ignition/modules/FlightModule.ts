// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FlightModule = buildModule("FlightModule", (m) => {
  const flightTicket = m.contract("FlightTicket", []);
  return { flightTicket };
});

export default FlightModule;
