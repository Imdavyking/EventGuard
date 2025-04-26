import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const secret: {
  read: (secretName: string) => string;
  loadAll: () => Record<string, string>;
} = {
  read: (secretName) => {
    try {
      return fs.readFileSync(`/run/secrets/${secretName}`, "utf8").trim();
    } catch (err: any) {
      const fromEnv = process.env[secretName];
      if (fromEnv) {
        return fromEnv;
      }
      console.log(`❌ Missing secret: ${secretName}`);
      return "";
    }
  },

  loadAll: () => {
    const secrets = [
      "NODE_ENV",
      "JWT_SECRET",
      "PORT",
      "FRONTEND_URL",
      "MONGO_URI",
      "JQ_VERIFIER_URL_TESTNET",
      "JQ_VERIFIER_API_KEY_TESTNET",
      "FLIGHT_TICKET_CONTRACT_ADDRESS",
      "RPC_URL",
      "OPENAI_API_KEY",
      "FDC_VERIFIER_URL_TESTNET",
      "FDC_VERIFIER_API_KEY_TESTNET",
    ];

    const loadedSecrets: Record<string, string> = {};

    secrets.forEach((secretName) => {
      loadedSecrets[secretName] = secret.read(secretName);
    });

    console.info("✅ All secrets loaded into memory.");
    return loadedSecrets;
  },
};

// Utility to mask secret names in logs
const mask = (name: string) => name.replace(/[a-zA-Z0-9]/g, "*");
