import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Ensure .env is loaded before reading vars
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("[Cloudinary] cloud_name loaded:", process.env.CLOUDINARY_CLOUD_NAME || "⚠️  MISSING");

export default cloudinary;
