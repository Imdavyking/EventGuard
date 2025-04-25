import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import { environment } from "../utils/config";
import { MemorySaver } from "@langchain/langgraph";
dotenv.config();
const openAIApiKey = environment.OPENAI_API_KEY!;
const checkpointSaver = new MemorySaver();
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: openAIApiKey,
});
export async function runAIAgent({
  userPrompt,
  userAddress,
}: {
  userPrompt: string;
  userAddress: string;
}) {
  const tools = {
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

  const points = await checkpointSaver.get({
    configurable: { thread_id: userAddress ?? "0x0001" },
  });

  console.log("Checkpoint:", points);

  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats`
  );
  const result = await llm
    .bind({
      tools: Object.values(tools),
    })
    .invoke([systemPrompt, new HumanMessage(userPrompt)]);

  return { content: result.content, tool_calls: result.tool_calls };
}
