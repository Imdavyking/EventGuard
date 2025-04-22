import express from "express";
import { getJsonProof } from "../controllers/fdc.controllers";

const fdcRoutes = express.Router();
fdcRoutes.post("/json-proof/:flightId", getJsonProof);
export default fdcRoutes;
