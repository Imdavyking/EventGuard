import express from "express";
import { getFlight } from "../controllers/flight.controllers";

const flightRoutes = express.Router();
flightRoutes.get("/status/:flightId", getFlight);
export default flightRoutes;
