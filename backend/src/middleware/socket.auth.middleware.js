import { clerkClient, verifyToken } from "@clerk/express";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    if (!token) {
      console.log("Socket connection rejected: No token provided");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // Strip 'Bearer ' prefix if it was accidentally included
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // Verify the Clerk token
    let payload;
    try {
      payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    } catch (e) {
      console.log("Socket connection rejected: Invalid Clerk token →", e.message);
      return next(new Error("Unauthorized - Invalid Token"));
    }

    const clerkId = payload.sub;

    // Find or sync user in MongoDB
    let user = await User.findOne({ clerkId }).select("-password");

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        email?.split("@")[0] ||
        "User";
      const profilePic = clerkUser.imageUrl || "";

      user = await User.findOneAndUpdate(
        { email },
        { $set: { clerkId, fullName, profilePic } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).select("-password");
    }

    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);
    next();
  } catch (error) {
    console.log("Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};

