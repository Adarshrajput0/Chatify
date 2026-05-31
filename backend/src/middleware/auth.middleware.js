import { clerkClient, verifyToken } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the Clerk token
    let payload;
    try {
      payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    } catch (e) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const clerkId = payload.sub;

    // Try to find existing user by clerkId
    let user = await User.findOne({ clerkId }).select("-password");

    if (!user) {
      // First time — fetch user details from Clerk and upsert into MongoDB
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        email?.split("@")[0] ||
        "User";
      const profilePic = clerkUser.imageUrl || "";

      // Try to find by email (for users who previously used email/password)
      user = await User.findOneAndUpdate(
        { email },
        { $set: { clerkId, fullName, profilePic } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).select("-password");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

