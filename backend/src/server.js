import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.router.js";
import messageRouter from "./routes/message.router.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
