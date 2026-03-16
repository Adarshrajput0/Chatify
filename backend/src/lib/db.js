import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const { MONGO_URL } = ENV;
    if (!MONGO_URL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    const conn = await mongoose.connect(ENV.MONGO_URL);
    console.log("MongoDB Connected Successfully:", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // 1 status code indicates fail, 0 indicates success
  }
};
