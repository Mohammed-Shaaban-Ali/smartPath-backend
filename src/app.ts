import express, { Application } from "express";
import { API_PREFIX } from "./constants";
import cors from "cors";
import formatRes from "./utils/format-res.util";
import errorHandler from "./middlewares/error-handler.middleware";
import AppError from "./utils/app-error.util";
// Routes imports

import authenticationRouter from "./routers/authentication.router";
import userRouter from "./routers/user.router";
import trackRouter from "./routers/track.routers";
import roadmapRouter from "./routers/roadmap.router";
import blogRouter from "./routers/blog.router";
import GroupRouter from "./routers/group.router";
import MessageRouter from "./routers/message.router";
import CoursesRouter from "./routers/courses.router";
import DashboardRouter from "./routers/dashboard.router";

import passport from "passport";
import { configurePassport } from "./utils/passport-setup.util";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());

// TESTING API
configurePassport(passport);

// Routes
app.use(`${API_PREFIX}/user`, userRouter);
app.use(`${API_PREFIX}/auth`, authenticationRouter);
app.use(`${API_PREFIX}/track`, trackRouter);
app.use(`${API_PREFIX}/roadmap`, roadmapRouter);
app.use(`${API_PREFIX}/blog`, blogRouter);
app.use(`${API_PREFIX}/message`, MessageRouter);
app.use(`${API_PREFIX}/group`, GroupRouter);
app.use(`${API_PREFIX}/courses`, CoursesRouter);
app.use(`${API_PREFIX}/dashboard`, DashboardRouter);

// Base route
app.get("/", (req, res) => {
  res.status(200).json(formatRes("API server is running..."));
});
app.get("/test", (req, res) => {
  res.status(200).json(formatRes("a7a ana is running..."));
});

// Not-Found
app.use((req, res, next) => {
  next(new AppError("This service is unavailable", 404));
});

app.use(errorHandler);

export default app;
