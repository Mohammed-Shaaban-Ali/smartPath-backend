"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const cors_1 = __importDefault(require("cors"));
const format_res_util_1 = __importDefault(require("./utils/format-res.util"));
const error_handler_middleware_1 = __importDefault(require("./middlewares/error-handler.middleware"));
const app_error_util_1 = __importDefault(require("./utils/app-error.util"));
// Routes imports
const comp_assess_router_1 = __importDefault(require("./routers/comp-assess.router"));
const word_finder_router_1 = __importDefault(require("./routers/word-finder.router"));
const wordlist_router_1 = __importDefault(require("./routers/wordlist.router"));
const authentication_router_1 = __importDefault(require("./routers/authentication.router"));
const authentication_middleware_1 = require("./middlewares/authentication.middleware");
const passport_1 = __importDefault(require("passport"));
const passport_setup_1 = require("./utils/passport-setup");
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["https://am-english-tools.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// TESTING API
(0, passport_setup_1.configurePassport)(passport_1.default);
// Routes
app.use(`${constants_1.API_PREFIX}/word-finder`, authentication_middleware_1.authMiddleware, word_finder_router_1.default);
app.use(`${constants_1.API_PREFIX}/comprehension-assessment`, authentication_middleware_1.authMiddleware, comp_assess_router_1.default);
app.use(`${constants_1.API_PREFIX}/auth`, authentication_router_1.default);
app.use(`${constants_1.API_PREFIX}/wordlist`, authentication_middleware_1.authMiddleware, wordlist_router_1.default);
// Base route
app.get("/", (req, res) => {
    res.status(200).json((0, format_res_util_1.default)("API server is running..."));
});
// Not-Found
app.use((req, res, next) => {
    next(new app_error_util_1.default("This service is unavailable", 404));
});
app.use(error_handler_middleware_1.default);
exports.default = app;
