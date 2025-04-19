import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export const getJsonProof = async (req: Request, res: Response) => {
  try {
    res.json({});
    return;
  } catch (error) {
    console.error("Error generating JSON proof:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const getSample = async (req: Request, res: Response) => {
  try {
    const sample = {
      latitude: 46419402,
      longitude: 15587079,
      description: "clear sky",
      temperature: 16250000,
      minTemp: 16000000,
      windSpeed: 2060000,
      windDeg: 340,
    };
    res.json(sample);
    return;
  } catch (error) {
    console.error("Error generating sample OpenWeather data:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
