/** @format */

import { flareTestnet } from "wagmi/chains";
import { callLLMApi } from "../services/agent.services";
import {
  sendNativeToken,
  sendERC20Token,
  tokenBalance,
  walletAddress,
} from "../services/blockchain.services";

export class AIAgent {
  tools: { [key: string]: Function };
  toolsInfo: { [key: string]: string };

  constructor() {
    this.tools = {
      CMD_SEND_NATIVE: sendNativeToken,
      CMD_SEND_ERC20: sendERC20Token,
      QRY_TOKEN_BAL: tokenBalance,
      QRY_WALLET_ADDRESS: walletAddress,
    };
    this.toolsInfo = {
      sendNativeToken:
        "Example: Send 10 FLR to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
      sendERC20Token:
        "Example: Send 10 USDC to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
      tokenBalance: `Example: Get balance of ${flareTestnet.nativeCurrency.name}`,
      walletAddress: "Example: Get wallet address",
    };
  }

  private async executeAction(action: any) {
    const tool = this.tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }
    return tool.bind(this)(action.args ? action.args : {});
  }

  public async solveTask(userPrompt: string): Promise<any> {
    const userAddress = await walletAddress();
    const action = await callLLMApi({
      userPrompt,
      userAddress,
    });

    const results: string[] = [];

    if (action.tool_calls.length === 0 && action.content.trim() !== "") {
      results.push(action.content);
    }
    for (const toolCall of action.tool_calls) {
      const result = await this.executeAction(toolCall);
      results.push(result);
    }

    return {
      results,
      needsMoreData: action.content.trim() !== "",
    };
  }
}
