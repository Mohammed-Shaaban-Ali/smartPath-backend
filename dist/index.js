"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const app_error_util_1 = __importDefault(require("./utils/app-error.util"));
dotenv_1.default.config();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
// DB connection
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log("DB is connected"))
    .catch(() => {
    throw new app_error_util_1.default("DB Can't connect", 500);
});
// Start the server
app_1.default.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
