import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/auth.router.js";
import messageRoutes from "./routes/message.router.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5003;

const allowedOrigins = ENV.CLIENT_URL
  ? [ENV.CLIENT_URL]
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(clerkMiddleware());
app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  // __dirname = /opt/render/project/src/backend/src
  // so go up 2 levels to reach repo root, then into frontend/dist
  const frontendPath = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendPath));

  // Catch-all: serve index.html for any unmatched route (SPA support)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
  connectDB();
});
