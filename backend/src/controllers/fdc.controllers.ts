import { Request, Response } from "express";
import dotenv from "dotenv";
import { getJsonAttestation } from "../services/fdc.services";
dotenv.config();

export const getJsonProof = async (req: Request, res: Response) => {
  try {
    const data = await getJsonAttestation();
    res.json({ data });
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
      coord: {
        lon: -122.419416,
        lat: 37.774956,
      },
      weather: [
        {
          description: "clear sky",
        },
      ],
      main: {
        temp: 289.15,
        temp_min: 286.48,
      },
      wind: {
        speed: 5.3,
        deg: 270,
      },
    };
    res.json(sample);
    return;
  } catch (error) {
    console.error("Error generating sample OpenWeather data:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
