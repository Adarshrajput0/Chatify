import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    messageType: {
      type: String,
      enum: ["text", "call"],
      default: "text",
    },
    callStatus: {
      type: String,
      enum: ["completed", "missed", "declined"],
    },
    callDuration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
