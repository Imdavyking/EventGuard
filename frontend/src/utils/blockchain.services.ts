import { BrowserProvider, ethers } from "ethers";
import { flareTestnet } from "viem/chains";
import { FAILED_KEY, FLIGHT_TICKET_CONTRACT_ADDRESS } from "./constants";
import flightTicketAbi from "../assets/json/flight-ticket.json";

const flightAbiInterFace = new ethers.Interface(flightTicketAbi);

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

    if (currentChainId === targetChainId) {
      console.log(`Already connected to ${targetChainId}`);
      return;
    }

    console.log(
      `Current chainId: ${currentChainId}, Switch chainId: ${targetChainId}`
    );

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

export const getSigner = async () => {
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export const getBlockNumber = async () => {
  try {
    const signer = await getSigner();
    await switchOrAddChain(signer.provider, flareTestnet.id);
    const blockNumber = await signer.provider.getBlockNumber();
    return blockNumber;
  } catch (error) {
    console.error("Error getting block number:", error);
    throw error;
  }
};

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

  return new ethers.Contract(
    FLIGHT_TICKET_CONTRACT_ADDRESS,
    flightAbiInterFace,
    signer
  );
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
    return `Created Flight with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(error);
    return `${FAILED_KEY}${parsedError?.name ?? error.message}`;
  }
};
export const payForFlight = async ({
  flightId,
  token,
}: {
  token: string;
  flightId: string;
}) => {
  try {
    const flightTicket = await getFlightTicketContract();
    const flightDetails = await flightTicket.flights(flightId);
    const usdPrice = flightDetails[3];
    const tokenPrice = await flightTicket.getUsdToTokenPrice(token, usdPrice);

    const transaction = await flightTicket.payForFlight(flightId, token, {
      value: tokenPrice,
    });

    const receipt = await transaction.wait(1);
    return `Bought Ticket with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(error);
    return `${FAILED_KEY}${parsedError?.name ?? error.message}`;
  }
};

export const refundTicket = async ({
  flightId,
  proof,
}: {
  flightId: string;
  proof: any;
}) => {
  try {
    const flightTicket = await getFlightTicketContract();
    const transaction = await flightTicket.refundTicket(flightId, proof);

    const receipt = await transaction.wait(1);
    return `Created Flight with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(error);
    return `${FAILED_KEY}${parsedError?.name ?? error.message}`;
  }
};

export const rethrowFailedResponse = (response: string) => {
  if (response.includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
