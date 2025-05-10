import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import AppError from "./utils/app-error.util";
import http from "http";
import { setupSocket } from "./config/socket";

dotenv.config();

// Use environment variables to get the port for both Express and Socket.io
const PORT = process.env.PORT || 8080; // Default to 8080 if PORT is not set
const MONGO_URI = process.env.MONGO_URI as string;

// Create the HTTP server for both Express and Socket.io
const server = http.createServer(app);

// Set up Socket.io on the same server
setupSocket(server);

// DB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB is connected");

    // Start the server (both HTTP and Socket.io)
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    throw new AppError("DB can't connect", 500);
  });
