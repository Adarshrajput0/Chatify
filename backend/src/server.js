import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.router.js";
import messageRoutes from "./routes/message.router.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.PORT || 5002;

app.use(express.json({ limit: "5mb" })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../../frontend", "dist")));

//   app.get("*", (_, res) => {
//     res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
//   });
// }

if (ENV.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../../frontend/dist");

  app.use(express.static(frontendDist));

  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
  connectDB();
});
