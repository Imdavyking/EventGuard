import { Request, Response } from "express";
import { runAIAgent } from "../services/agent.services";
import dotenv from "dotenv";
dotenv.config();

/**
 * Handles LLM API requests
 * @route POST /api/llm
 */
export const processLLMRequest = async (req: Request, res: Response) => {
  try {
    const { userPrompt, userAddress } = req.body;

    if (!userPrompt) {
      res.status(400).json({
        error: "Missing required fields: userPrompt",
      });
      return;
    }

    if (!userAddress) {
      res.status(400).json({
        error: "Missing required fields: userAddress",
      });
      return;
    }

    const generateActions = await runAIAgent({ userPrompt, userAddress });

    res.json(generateActions);
  } catch (error) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
