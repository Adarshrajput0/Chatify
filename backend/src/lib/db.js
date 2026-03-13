import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully:", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // 1 status code indicates fail, 0 indicates success
  }
};
