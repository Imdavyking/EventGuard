import { BrowserProvider, ethers } from "ethers";
import { flareTestnet } from "viem/chains";
import flightTicketAbi from "../assets/json/flightTicket.json";
import { FLIGHT_TICKET_CONTRACT_ADDRESS } from "./constants";
import { FlightTicket__factory } from "../typechain-types";

const failedKey = "FAILED-";

const flightTicketAbiInterface = new ethers.Interface(flightTicketAbi);

export async function switchOrAddChain(
  ethProvider: ethers.JsonRpcApiProvider,
  switchChainId: string | number
) {
  try {
    const currentChainId = Number(
      await ethProvider.provider.send("eth_chainId", [])
    );
    const targetChainId = Number(switchChainId);
    const chainIdHex = `0x${targetChainId.toString(16)}`;

    console.log(
      `Current chainId: ${currentChainId}, Switch chainId: ${targetChainId}`
    );

    if (currentChainId === targetChainId) {
      console.log(`Already connected to ${targetChainId}`);
      return;
    }

    try {
      await ethProvider.provider.send("wallet_switchEthereumChain", [
        { chainId: chainIdHex },
      ]);
      console.log(`Switched to ${targetChainId}`);
    } catch (error: any) {
      console.error(`Error switching chain:`, error);

      if (error.code === 4902) {
        console.log(`Chain ${targetChainId} not found. Attempting to add.`);

        if (targetChainId === Number(flareTestnet.id)) {
          await ethProvider.provider.send("wallet_addEthereumChain", [
            {
              chainId: chainIdHex,
              chainName: flareTestnet.name,
              nativeCurrency: {
                name: flareTestnet.nativeCurrency.name,
                symbol: flareTestnet.nativeCurrency.symbol,
                decimals: flareTestnet.nativeCurrency.decimals,
              },
              rpcUrls: [flareTestnet.rpcUrls.default.http[0]],
              blockExplorerUrls: [flareTestnet.blockExplorers.default.url],
            },
          ]);
          console.log(`${flareTestnet.name} added and switched`);
        }
      } else {
        console.error(`Failed to switch to ${targetChainId}:`, error);
      }
    }
  } catch (error) {
    console.error(`Unexpected error in switchOrAddChain:`, error);
  }
}

function parseContractError(error: any, contractInterface: ethers.Interface) {
  if (!error?.data || !contractInterface) return null;

  try {
    const errorFragment = contractInterface.fragments.find(
      (fragment) =>
        fragment.type === "error" &&
        error.data.startsWith((fragment as any).selector)
    );

    return errorFragment ? contractInterface.parseError(error.data) : null;
  } catch (err) {
    console.error("Error parsing contract error:", err);
    return null;
  }
}

export const getSigner = async () => {
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export const getFlightTicketContract = async () => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    throw new Error(
      "MetaMask is not installed. Please install it to use this feature."
    );
  }

  const signer = await getSigner();

  await switchOrAddChain(signer.provider, flareTestnet.id);

  return FlightTicket__factory.connect(FLIGHT_TICKET_CONTRACT_ADDRESS, signer);
};

export const createFlight = async ({
  route,
  date,
  amountInUsd,
}: {
  route: string;
  date: number;
  amountInUsd: number;
}) => {
  try {
    const flightTicket = await getFlightTicketContract();
    const transaction = await flightTicket.createFlight(
      route,
      date,
      amountInUsd
    );

    const receipt = await transaction.wait(1);
    return `Uploaded dataset with tx hash: ${receipt!.hash}`;
  } catch (error: any) {
    if (error.code === "CALL_EXCEPTION") {
      console.log(error.errorName);
      if (error.errorName === "FlightTicket__FlightNotFound") {
        // Now handle that specific custom error cleanly
        alert("Flight not found!");
      }
    }
    const parsedError = parseContractError(error, flightTicketAbiInterface);
    console.error("Error saving cid:", error);
    return `${failedKey}${parsedError?.name ?? error?.message}`;
  }
};
