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
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const SOCKETPORT = process.env.SOCKETPORT || 8000;
// Create the HTTP server
const server = http_1.default.createServer(app_1.default);
// Set up socket.io
(0, socket_1.setupSocket)(server);
// DB connection
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("DB is connected");
    // Start the server (both HTTP and Socket.io)
    server.listen(SOCKETPORT, () => console.log(`✅ Socket Server running on http://localhost:${SOCKETPORT}`));
})
    .catch((err) => {
    console.error("DB connection error:", err);
    throw new app_error_util_1.default("DB can't connect", 500);
});
// Start the Express app (HTTP server)
app_1.default.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
