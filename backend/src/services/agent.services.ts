import { ChatOpenAI } from "@langchain/openai";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import dotenv from "dotenv";
import { environment } from "../utils/config";
import { tools } from "../utils/agent.tools";

dotenv.config();
const openAIApiKey = environment.OPENAI_API_KEY!;
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: openAIApiKey,
});
const chatHistory: Record<string, BaseMessage[]> = {};

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
  const userMessage = new HumanMessage(userPrompt);
  if (typeof chatHistory[userAddress] === "undefined") {
    chatHistory[userAddress] = [];
  }
  chatHistory[userAddress].push(userMessage);
  const messages = [systemPrompt, ...chatHistory[userAddress], userMessage];

  // Invoke the AI agent
  const aiMessage = await llmWithTools.invoke(messages);

  chatHistory[userAddress].push(aiMessage);

  if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
    aiMessage.tool_calls.forEach((toolCall) => {
      const message = new ToolMessage({
        content: toolCall.name,
        tool_call_id: toolCall.id!,
      });
      chatHistory[userAddress].push(message);
    });
  }

  return {
    content: aiMessage.content,
    tool_calls: aiMessage.tool_calls,
  };
}
