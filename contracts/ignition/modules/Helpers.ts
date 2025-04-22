// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HelpersModule = buildModule("HelpersModule", (m) => {
  const helpers = m.contract("Helpers", []);
  return { helpers };
});

export default HelpersModule;
