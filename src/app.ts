import express, { Application } from "express";
import { API_PREFIX } from "./constants";
import cors from "cors";
import formatRes from "./utils/format-res.util";
import errorHandler from "./middlewares/error-handler.middleware";
import AppError from "./utils/app-error.util";
// Routes imports

import authenticationRouter from "./routers/authentication.router";
import userRouter from "./routers/user.router";
import { authMiddleware } from "./middlewares/authentication.middleware";
import passport from "passport";
import { configurePassport } from "./utils/passport-setup.util";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// TESTING API
configurePassport(passport);

// Routes

app.use(`${API_PREFIX}/user`, userRouter);
app.use(`${API_PREFIX}/auth`, authenticationRouter);

// Base route
app.get("/", (req, res) => {
  res.status(200).json(formatRes("API server is running..."));
});

// Not-Found
app.use((req, res, next) => {
  next(new AppError("This service is unavailable", 404));
});

app.use(errorHandler);

export default app;
