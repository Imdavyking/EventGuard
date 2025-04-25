import { tool } from "@langchain/core/tools";
import { z } from "zod";

const userTools = {
  tokenBalance: tool(() => undefined, {
    name: "QRY_TOKEN_BAL",
    description: "Get the balance of a token in a wallet.",
    schema: z.object({
      tokenAddress: z.string().describe("The token to check"),
    }),
  }),
  walletAddress: tool(() => undefined, {
    name: "QRY_WALLET_ADDRESS",
    description: "Get the wallet address of the user.",
    schema: z.object({}),
  }),
  sendERC20Token: tool(() => undefined, {
    name: "CMD_SEND_ERC20",
    description: "Send ERC20 tokens to a specific address.",
    schema: z.object({
      tokenAddress: z.string().describe("The token to send"),
      recipientAddress: z.string().describe("The address to send tokens to"),
      amount: z.number().describe("The amount of tokens to send"),
    }),
  }),
  sendNativeToken: tool(() => undefined, {
    name: "CMD_SEND_NATIVE",
    description: "Send Native tokens to a specific address.",
    schema: z.object({
      recipientAddress: z.string().describe("The address to send tokens to"),
      amount: z.number().describe("The amount of tokens to send"),
    }),
  }),
};

export const tools = Object.values(userTools);
