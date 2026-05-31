import express from "express";
import { checkAuth, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);

// Verify Clerk token + sync user into MongoDB, return the user object
router.get("/check", protectRoute, checkAuth);

// Update profile picture (Cloudinary upload)
router.put("/update-profile", protectRoute, updateProfile);

export default router;
