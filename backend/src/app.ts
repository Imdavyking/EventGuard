import dotenv from "dotenv";
import logger from "./config/logger";
import { environment } from "./utils/config";
import io from "./utils/create.websocket";

io.emit("connection", (data: any) => {
  logger.info(`user connected ${data}`);
});
import server from "./utils/create.server";
import { connectDB } from "./database/connection";
import { getJsonAttestation } from "./services/fdc.services";

dotenv.config();

// Database connection
connectDB();

getJsonAttestation(
  "30781437108067454011254090985990501508650751100070793840913752776042900174893"
);

// Start the server
const PORT = environment.PORT || 3000;

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
