import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true, // allows null/undefined without uniqueness conflict
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      minlength: 6,
      default: null,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }, // createdAt, updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;
