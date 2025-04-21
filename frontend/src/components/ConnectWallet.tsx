// compoenents/ConnectWallet.tsx

"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

const ConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.button
                    onClick={openConnectModal}
                    style={{ color: "black" }}
                    className="btn  btn-outline-secondary bg-white py-3 text-primary px-4 w-48 mt-3 xl:mt-0 align-top mr-3"
                  >
                    Connect Wallet
                  </motion.button>
                );
              }

              if (chain.unsupported) {
                return (
                  <motion.button
                    onClick={openChainModal}
                    className="btn btn-outline-secondary bg-white py-3 text-primary px-4 w-48 mt-3 xl:mt-0 align-top mr-3"
                    style={{ color: "black" }}
                  >
                    Wrong Network
                  </motion.button>
                );
              }

              return (
                <motion.button
                  onClick={openAccountModal}
                  className="btn  btn-outline-secondary bg-white py-3 text-primary px-4 w-48 mt-3 xl:mt-0 align-top mr-3"
                  style={{ color: "black" }}
                >
                  {account.displayName}
                </motion.button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWallet;
