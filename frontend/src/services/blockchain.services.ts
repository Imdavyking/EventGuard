import { BrowserProvider, ethers } from "ethers";
import { flareTestnet, sepolia } from "viem/chains";
import {
  BACKEND_URL,
  FAILED_KEY,
  FLIGHT_TICKET_CONTRACT_ADDRESS,
  NATIVE_TOKEN,
} from "../utils/constants";
import flightTicketAbi from "../assets/json/flight-ticket.json";
import erc20Abi from "../assets/json/erc20.json";
import { FDCServiceEVMTransaction } from "./fdc.crosschain.services";
import { getWholeNumber } from "../utils/whole.util";

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
        } else if (targetChainId === Number(sepolia.id)) {
          await ethProvider.provider.send("wallet_addEthereumChain", [
            {
              chainId: chainIdHex,
              chainName: sepolia.name,
              nativeCurrency: {
                name: sepolia.nativeCurrency.name,
                symbol: sepolia.nativeCurrency.symbol,
                decimals: sepolia.nativeCurrency.decimals,
              },
              rpcUrls: [sepolia.rpcUrls.default.http[0]],
              blockExplorerUrls: [sepolia.blockExplorers.default.url],
            },
          ]);
          console.log(`${sepolia.name} added and switched`);
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

  if (error.reason && typeof error.reason === "string") {
    return error.reason;
  }

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

export const sendNativeToken = async ({
  recipientAddress,
  amount,
}: {
  recipientAddress: string;
  amount: number;
}) => {
  try {
    const signer = await getSigner();
    await switchOrAddChain(signer.provider, flareTestnet.id);
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
    });
    await tx.wait(1);

    return `sent ${amount} ${flareTestnet.nativeCurrency.name} to ${recipientAddress}`;
  } catch (error) {
    return `${FAILED_KEY} to send ${amount} ${flareTestnet.nativeCurrency.name} to ${recipientAddress}`;
  }
};

export const sendERC20Token = async ({
  tokenAddress,
  recipientAddress,
  amount,
}: {
  tokenAddress: string;
  recipientAddress: string;
  amount: number;
}) => {
  try {
    const contract = await getERC20Contract(tokenAddress);

    const [decimals, name] = await Promise.all([
      contract.decimals(),
      contract.name(),
    ]);

    const tx = await contract.transfer(
      recipientAddress,
      getWholeNumber(Number(amount) * 10 ** Number(decimals))
    );
    await tx.wait(1);

    return `sent ${amount} ${
      name ? name : tokenAddress
    } to ${recipientAddress}`;
  } catch (error: any) {
    const errorInfo = parseContractError(error, erc20AbiInterface);
    return `${FAILED_KEY} to send ${amount} ${tokenAddress} to ${recipientAddress}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const walletAddress = async () => {
  try {
    const signer = await getSigner();
    return await signer.getAddress();
  } catch (error) {
    return `${FAILED_KEY} to get wallet address`;
  }
};

export const tokenBalance = async ({
  tokenAddress,
  switchChainId = flareTestnet.id,
}: {
  tokenAddress: string;
  switchChainId?: number;
}) => {
  let tokenName;
  try {
    const { balance, decimals, name } = await _tokenBalance({
      tokenAddress,
      switchChainId,
    });
    tokenName = name;
    return `${Number(balance) / 10 ** Number(decimals)} ${name}`;
  } catch (error) {
    return `${FAILED_KEY} to get ${tokenName} balance`;
  }
};
export const _tokenBalance = async ({
  tokenAddress,
  switchChainId = flareTestnet.id,
}: {
  tokenAddress: string;
  switchChainId?: number;
}) => {
  try {
    const signer = await getSigner();

    await switchOrAddChain(signer.provider, switchChainId);

    const address = await signer.getAddress();

    if (tokenAddress == ethers.ZeroAddress || tokenAddress == NATIVE_TOKEN) {
      const balance = await signer.provider.getBalance(address);
      return { balance, decimals: 18, name: flareTestnet.nativeCurrency.name };
    }

    const token = await getERC20Contract(tokenAddress, switchChainId);

    const [balance, decimals, name] = await Promise.all([
      token.balanceOf(address),
      token.decimals(),
      token.name(),
    ]);
    return { balance, decimals, name };
  } catch (error: any) {
    console.log(error.message);
    throw error;
  }
};

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
        const price = Number(tokenPrice) + 0.01 * Number(tokenPrice);
        const approveTx = await tokenContract.approve(
          FLIGHT_TICKET_CONTRACT_ADDRESS,
          price.toString()
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

export const getUSDCSepoliaAddress = async () => {
  const flightTicket = await getFlightTicketContract();
  const usdcSepoliaAddress = await flightTicket.USDC_SEPOLIA_CONTRACT();
  return usdcSepoliaAddress;
};

export const getUSDCFlareAddress = async () => {
  const flightTicket = await getFlightTicketContract();
  const usdcFlareAddress = await flightTicket.USDC_FLARE_CONTRACT();
  return usdcFlareAddress;
};

export const mintUSDCFlare = async () => {
  try {
    const flightTicket = await getFlightTicketContract();
    const usdcFlareAddress = await flightTicket.USDC_FLARE_CONTRACT();
    const usdcFlare = await getERC20Contract(usdcFlareAddress, flareTestnet.id);
    const decimals = Number(await usdcFlare.decimals());
    const signer = await getSigner();
    const owner = await signer.getAddress();
    const amount = (10 * 10 ** decimals).toString();
    const transaction = await usdcFlare.mint(owner, amount);

    const receipt = await transaction.wait(1);
    return `Minted token with: ${receipt!.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    console.error(`${FAILED_KEY}${parsedError ?? error.message}`);
    return `${FAILED_KEY}${parsedError ?? error.message}`;
  }
};

export const mintUSDCSepolia = async () => {
  try {
    const flightTicket = await getFlightTicketContract();
    const usdcFlareAddress = await flightTicket.USDC_SEPOLIA_CONTRACT();
    const usdcFlare = await getERC20Contract(usdcFlareAddress, sepolia.id);
    const decimals = Number(await usdcFlare.decimals());
    const signer = await getSigner();
    const owner = await signer.getAddress();
    const amount = (10 * 10 ** decimals).toString();
    const transaction = await usdcFlare.mint(owner, amount);
    const receipt = await transaction.wait(1);
    return `Minted token with: ${receipt!.hash}`;
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

// --- Constants ---
const USDC_TX_KEY_PREFIX = "tx-hash-usdc-sepolia";

const getUSDCKey = (flightId: string) => `${USDC_TX_KEY_PREFIX}-${flightId}`;

// --- Local Storage Utils ---
const saveUSDCTransaction = (hash: string, flightId: string) => {
  const data = {
    hash,
    flightId,
    time: new Date().toISOString(),
  };
  localStorage.setItem(getUSDCKey(flightId), JSON.stringify(data));
};

const getUSDCTransaction = (
  flightId: string
): { hash: string; flightId: string } | null => {
  const raw = localStorage.getItem(getUSDCKey(flightId));
  return raw ? JSON.parse(raw) : null;
};

const deleteUSDCTransaction = (flightId: string) => {
  localStorage.removeItem(getUSDCKey(flightId));
};

// --- Payment & Proof Logic ---
const useSepoliaUSCPay = async (flightId: string): Promise<string> => {
  try {
    const savedUSDCTransaction = getUSDCTransaction(flightId);
    if (savedUSDCTransaction) {
      console.log(
        `Transaction already exists for flightId ${flightId}: ${savedUSDCTransaction.hash}`
      );
      return `Transaction already exists for flightId ${flightId}: ${savedUSDCTransaction.hash}`;
    }
    const usdPrice = Number(await getFlightPriceUSD(flightId));
    const USDC_SEPOLIA = await getUSDCSepoliaAddress();
    const tokenContract = await getERC20Contract(USDC_SEPOLIA, sepolia.id);
    const decimals = Number(await tokenContract.decimals());

    const amount = (usdPrice * 10 ** decimals) / 100;
    const transferTx = await tokenContract.transfer(
      FLIGHT_TICKET_CONTRACT_ADDRESS,
      amount.toString()
    );

    const receipt = await transferTx.wait(1);
    saveUSDCTransaction(receipt.hash, flightId);

    return `✅ USDC Sepolia payment created with hash: ${receipt.hash}`;
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    const message = parsedError || error.message;
    console.error(`${FAILED_KEY}${message}`);
    return `${FAILED_KEY}${message}`;
  }
};

export const sepoliaUSDCPayAndProof = async (flightId: string) => {
  try {
    const response = await useSepoliaUSCPay(flightId);
    rethrowFailedResponse(response);
    const proofDetails = await submitSepoliaProofForFlight(flightId);
    rethrowFailedResponse(proofDetails);
  } catch (error: any) {
    const parsedError = parseContractError(error, flightAbiInterFace);
    const message = parsedError || error.message;
    console.error(`${FAILED_KEY}${message}`);
    return `${FAILED_KEY}${message}`;
  }
};

const submitSepoliaProofForFlight = async (flightId: string): Promise<any> => {
  try {
    const tx = getUSDCTransaction(flightId);
    if (!tx || !tx.hash)
      throw new Error("No USDC transaction found for this flight");

    const res = await fetch(
      `${BACKEND_URL}/api/fdc/evm-transaction-proof/${tx.hash}`
    );
    if (!res.ok) throw new Error(`Failed to fetch proof: ${res.statusText}`);

    const { data } = await res.json();
    console.log("Fetched proof data:", data);
    const signer = await getSigner();
    await switchOrAddChain(signer.provider, flareTestnet.id);

    const fdcService = new FDCServiceEVMTransaction();
    const proof = await fdcService.getDataAndStoreProof(data);

    const paymentInfo = await payUSDCSepoliaForFlight({ flightId, proof });

    deleteUSDCTransaction(flightId);
    return paymentInfo;
  } catch (error: any) {
    console.error(`❌ Error in submitting proof: ${error.message}`);
    throw error;
  }
};

export const rethrowFailedResponse = (response: string) => {
  if (response.includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
