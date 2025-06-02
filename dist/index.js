"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const app_error_util_1 = __importDefault(require("./utils/app-error.util"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./config/socket");
dotenv_1.default.config();
// Use environment variables to get the port for both Express and Socket.io
const PORT = process.env.PORT || 8080; // Default to 8080 if PORT is not set
const MONGO_URI = process.env.MONGO_URI;
// Create the HTTP server for both Express and Socket.io
const server = http_1.default.createServer(app_1.default);
// Set up Socket.io on the same server
(0, socket_1.setupSocket)(server);
// DB connection
mongoose_1.default
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
    throw new app_error_util_1.default("DB can't connect", 500);
});
