import express from "express";
import { getJsonProof, getSample } from "../controllers/fdc.controllers";

const fdcRoutes = express.Router();
fdcRoutes.post("/json-proof", getJsonProof);
fdcRoutes.post("/sample-open-weather", getSample);
export default fdcRoutes;
