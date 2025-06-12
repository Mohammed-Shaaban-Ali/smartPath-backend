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
const authentication_router_1 = __importDefault(require("./routers/authentication.router"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const track_routers_1 = __importDefault(require("./routers/track.routers"));
const roadmap_router_1 = __importDefault(require("./routers/roadmap.router"));
const blog_router_1 = __importDefault(require("./routers/blog.router"));
const group_router_1 = __importDefault(require("./routers/group.router"));
const message_router_1 = __importDefault(require("./routers/message.router"));
const courses_router_1 = __importDefault(require("./routers/courses.router"));
const dashboard_router_1 = __importDefault(require("./routers/dashboard.router"));
const passport_1 = __importDefault(require("passport"));
const passport_setup_util_1 = require("./utils/passport-setup.util");
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// TESTING API
(0, passport_setup_util_1.configurePassport)(passport_1.default);
// Routes
app.use(`${constants_1.API_PREFIX}/user`, user_router_1.default);
app.use(`${constants_1.API_PREFIX}/auth`, authentication_router_1.default);
app.use(`${constants_1.API_PREFIX}/track`, track_routers_1.default);
app.use(`${constants_1.API_PREFIX}/roadmap`, roadmap_router_1.default);
app.use(`${constants_1.API_PREFIX}/blog`, blog_router_1.default);
app.use(`${constants_1.API_PREFIX}/message`, message_router_1.default);
app.use(`${constants_1.API_PREFIX}/group`, group_router_1.default);
app.use(`${constants_1.API_PREFIX}/courses`, courses_router_1.default);
app.use(`${constants_1.API_PREFIX}/dashboard`, dashboard_router_1.default);
// Base route
app.get("/", (req, res) => {
    res.status(200).json((0, format_res_util_1.default)("API server is running..."));
});
app.get("/test", (req, res) => {
    res.status(200).json((0, format_res_util_1.default)("a7a ana is running..."));
});
// Not-Found
app.use((req, res, next) => {
    next(new app_error_util_1.default("This service is unavailable", 404));
});
app.use(error_handler_middleware_1.default);
exports.default = app;
