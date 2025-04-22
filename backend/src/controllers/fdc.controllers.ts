import { Request, Response } from "express";
import dotenv from "dotenv";
import { getJsonAttestation } from "../services/fdc.services";
dotenv.config();

export const getJsonProof = async (req: Request, res: Response) => {
  try {
    const { flightId } = req.params;
    const data = await getJsonAttestation(flightId);
    res.json({ data });
    return;
  } catch (error) {
    console.error("Error generating JSON proof:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
