import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRouter from "./routes/auth.router.js";
import messageRouter from "./routes/message.router.js";
import { connectDB } from "./lib/db.js";
dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 3000;

app.use(express.json()); //req.body
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// make ready for deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});
