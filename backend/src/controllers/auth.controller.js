import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
export const singup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    //validation
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }
    //123344  => @#$scdcjsdjkcdjk_?dcnhfbf
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};
