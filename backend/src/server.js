import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import authRouter from "./routes/auth.router.js";
import messageRouter from "./routes/message.router.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

// const app = express();
const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(
  cors({ origin: "https://chit-chat-523a.onrender.com", credentials: true }),
);

app.use(cookieParser());
//req.body
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
console.log("CLIENT_URL:", ENV.CLIENT_URL);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});
