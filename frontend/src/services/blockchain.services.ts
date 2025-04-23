import { BrowserProvider, ethers } from "ethers";
import { flareTestnet, sepolia } from "viem/chains";
import {
  BACKEND_URL,
  FAILED_KEY,
  FLIGHT_TICKET_CONTRACT_ADDRESS,
  NATIVE_TOKEN,
  USDC_SEPOLIA,
} from "../utils/constants";
import flightTicketAbi from "../assets/json/flight-ticket.json";
import erc20Abi from "../assets/json/erc20.json";
import { FDCServiceEVMTransaction } from "./fdc.crosschain.services";

const flightAbiInterFace = new ethers.Interface(flightTicketAbi);
const erc20AbiInterface = new ethers.Interface(erc20Abi);

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
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install it to use this feature."
    );
  }
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

    if (errorFragment && "name" in errorFragment && errorFragment.name) {
      return errorFragment.name;
    }

    return errorFragment
      ? contractInterface.parseError(error.data)?.name
      : null;
  } catch (err) {
    console.error("Error parsing contract error:", err);
    return null;
  }
}

export const getFlightTicketContract = async () => {
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, flareTestnet.id);

  return new ethers.Contract(
    FLIGHT_TICKET_CONTRACT_ADDRESS,
    flightAbiInterFace,
    signer
  );
};

export const getERC20Contract = async (
  tokenAddress: string,
  chainId: number = flareTestnet.id
) => {
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, chainId);
  return new ethers.Contract(tokenAddress, erc20AbiInterface, signer);
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
    console.error(`${FAILED_KEY}${parsedError ?? error.message}`);
    return `${FAILED_KEY}${parsedError ?? error.message}`;
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

    const isERC20Token = token.toLowerCase() !== NATIVE_TOKEN.toLowerCase();
    if (isERC20Token) {
      const tokenContract = await getERC20Contract(token);
      const signer = await getSigner();
      const owner = await signer.getAddress();
      const allowance = await tokenContract.allowance(
        owner,
        FLIGHT_TICKET_CONTRACT_ADDRESS
      );
      if (allowance < tokenPrice) {
        const approveTx = await tokenContract.approve(
          FLIGHT_TICKET_CONTRACT_ADDRESS,
          tokenPrice
        );
        await approveTx.wait(1);
      }
    }

    const transaction = await flightTicket.payForFlight(flightId, token, {
      value: isERC20Token ? 0 : tokenPrice,
    });

    const receipt = await transaction.wait(1);
    return `Bought Ticket with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(`${FAILED_KEY}${parsedError ?? error.message}`);
    return `${FAILED_KEY}${parsedError ?? error.message}`;
  }
};

export const payUSDCSepoliaForFlight = async ({
  flightId,
  proof,
}: {
  flightId: string;
  proof: any;
}) => {
  try {
    const flightTicket = await getFlightTicketContract();
    const transaction = await flightTicket.payUSDCSepoliaForFlight(
      flightId,
      proof
    );

    const receipt = await transaction.wait(1);
    return `Bought Ticket with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(`${FAILED_KEY}${parsedError ?? error.message}`);
    return `${FAILED_KEY}${parsedError ?? error.message}`;
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
    console.error(`${FAILED_KEY}${parsedError ?? error.message}`);
    return `${FAILED_KEY}${parsedError ?? error.message}`;
  }
};

const getFlightPriceUSD = async (flightId: string) => {
  const flightTicket = await getFlightTicketContract();

  const flightDetails = await flightTicket.flights(flightId);
  return flightDetails[3];
};

const useSepoliaUSCPay = async (flightId: string) => {
  try {
    const usdPrice = await getFlightPriceUSD(flightId);
    const tokenContract = await getERC20Contract(USDC_SEPOLIA, sepolia.id);
    const transferTx = await tokenContract.transfer(
      FLIGHT_TICKET_CONTRACT_ADDRESS,
      usdPrice
    );
    const receipt = await transferTx.wait(1);
    saveTXUSDCSepolia(receipt!.hash, flightId);
    return `Created USDC Sepolia payment with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(`${FAILED_KEY}${parsedError ?? error.message}`);
    return `${FAILED_KEY}${parsedError ?? error.message}`;
  }
};

const USDC_SEPOLIA_KEY = "tx-hash-usdc-sepolia";
const saveTXUSDCSepolia = (transactionHash: string, flightId: string) => {
  localStorage.setItem(
    USDC_SEPOLIA_KEY,
    JSON.stringify({
      hash: transactionHash,
      flightId: flightId,
      time: new Date().toISOString(),
    })
  );
};

const getTXUSDCSepolia = (): {
  hash: string;
  flightId: string;
} => {
  const value = localStorage.get(USDC_SEPOLIA_KEY);
  if (!value) {
    return {
      hash: "",
      flightId: "",
    };
  }
  return JSON.parse(value);
};

const getTXUSDCSepoliaAndUseProof = async () => {
  try {
    const getTX = getTXUSDCSepolia();
    const response = await fetch(
      `${BACKEND_URL}/api/fdc/evm-transaction-proof/${getTX.hash}`
    );
    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Flight proof data:", data);

    const fdcService = new FDCServiceEVMTransaction();
    const proof = await fdcService.getDataAndStoreProof(data.data);

    const paymentInfo = await payUSDCSepoliaForFlight({
      flightId: getTX.flightId,
      proof,
    });
    return paymentInfo;
  } catch (e) {}
};

export const rethrowFailedResponse = (response: string) => {
  if (response.includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
