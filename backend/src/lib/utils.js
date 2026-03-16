import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId: userId }, JWT_SECRET, {
    expiresIn: "10d",
  });
  res.cookie("jwt", token, {
    maxAge: 10 * 24 * 60 * 60 * 1000, //10 days
    httpOnly: true, //prevent excess attack: cross site scripting attack
    sameSite: "strict", //prevent cross site request forgery attack
    secure: ENV.NODE_ENV === "development" ? false : true, // in production, cookie will be sent only over https
  });
  return token;
};

// in development http://localhost
// in production https://chatify.com
