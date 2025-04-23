import express from "express";
import {
  getEVMTransactionProof,
  getJsonProof,
} from "../controllers/fdc.controllers";

const fdcRoutes = express.Router();
fdcRoutes.get("/json-proof/:flightId", getJsonProof);
fdcRoutes.get(
  "/evm-transaction-proof/:transactionHash",
  getEVMTransactionProof
);
export default fdcRoutes;
