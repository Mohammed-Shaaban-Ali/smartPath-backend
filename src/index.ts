import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import AppError from "./utils/app-error.util";
import http from "http";
import { setupSocket } from "./config/socket";

dotenv.config();
const PORT = process.env.PORT as string;
const MONGO_URI = process.env.MONGO_URI as string;
const SOCKETPORT = process.env.SOCKETPORT || 8000;

// Create the HTTP server
const server = http.createServer(app);

// Set up socket.io
setupSocket(server);

// DB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB is connected");

    // Start the server (both HTTP and Socket.io)
    server.listen(SOCKETPORT, () =>
      console.log(`✅ Socket Server running on http://localhost:${SOCKETPORT}`)
    );
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    throw new AppError("DB can't connect", 500);
  });

// Start the Express app (HTTP server)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
