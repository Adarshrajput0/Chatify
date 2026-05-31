import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// /auth/check — called by the frontend after Clerk verifies the token.
// The protectRoute middleware already looked up (or created) the user in MongoDB,
// so we just return req.user here.
export const checkAuth = async (req, res) => {
  res.status(200).json(req.user);
};

// /auth/update-profile — update the user's profile picture via Cloudinary.
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
