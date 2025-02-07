import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import AppError from "./utils/app-error.util";

dotenv.config();
const PORT = process.env.PORT as string;
const MONGO_URI = process.env.MONGO_URI as string;

// DB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("DB is connected"))
  .catch(() => {
    throw new AppError("DB Can't connect", 500);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
