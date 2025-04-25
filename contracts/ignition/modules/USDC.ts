// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDCModule = buildModule("USDCModule", (m) => {
  const usdc = m.contract("USDC", []);
  return { usdc };
});

export default USDCModule;
