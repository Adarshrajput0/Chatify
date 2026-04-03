import dotenv from "dotenv";
dotenv.config(); //
import { Resend } from "resend";
import { ENV } from "./env.js";

export const resendClient = new Resend("re_M14uXjmE_EZcyDU8mS3JR2KK2F8HZgtu8");

export const sender = {
  email: ENV.EMAIL_FROM,
  name: ENV.EMAIL_FROM_NAME,
};
