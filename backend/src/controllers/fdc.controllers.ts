import { Request, Response } from "express";
import dotenv from "dotenv";
import {
  getEVMTransactionAttestation,
  getJsonAttestation,
} from "../services/fdc.services";
dotenv.config();

export const getJsonProof = async (req: Request, res: Response) => {
  try {
    const { flightId } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = await getJsonAttestation(flightId, baseUrl);
    res.json({ data });
    return;
  } catch (error) {
    console.error("Error generating JSON proof:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
export const getEVMTransactionProof = async (req: Request, res: Response) => {
  try {
    const { transactionHash } = req.params;
    const data = await getEVMTransactionAttestation(transactionHash);
    res.json({ data });
    return;
  } catch (error) {
    console.error("Error generating EVM Transaction proof:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
