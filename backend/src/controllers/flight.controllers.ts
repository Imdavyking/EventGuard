import { Request, Response } from "express";
import dotenv from "dotenv";
import { getFlightStatus } from "../services/flight.services";
dotenv.config();

export const getFlight = async (req: Request, res: Response) => {
  try {
    const { flightId } = req.params;
    const data = await getFlightStatus(flightId);
    res.json({ data });
    return;
  } catch (error) {
    console.error("Error generating JSON proof:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
