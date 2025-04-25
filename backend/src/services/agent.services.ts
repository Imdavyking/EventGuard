import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { environment } from "../utils/config";
import { tools } from "../utils/agent.tools";
dotenv.config();
const openAIApiKey = environment.OPENAI_API_KEY!;
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
  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats`
  );
  const llmWithTools = llm.bind({
    tools,
  });
  const result = await llmWithTools.invoke([
    systemPrompt,
    new HumanMessage(userPrompt),
  ]);

  return {
    content: result.content,
    tool_calls: result.tool_calls,
  };
}
