import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5003;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://chatifyy-youandi.onrender.com",
  `http://localhost:${PORT}`
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}
const activeCalls = {}; // {socketId: {peerSocketId, callerId, receiverId, startTime}}

async function saveCallLog({ senderId, receiverId, callStatus, callDuration }) {
  if (!senderId || !receiverId) return;
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      text: "Video call",
      messageType: "call",
      callStatus,
      callDuration,
    });
    await newMessage.save();

    const senderSocketId = userSocketMap[senderId];
    const receiverSocketId = userSocketMap[receiverId];

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  } catch (error) {
    console.error("Error saving call log:", error);
  }
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Video calling signals
  socket.on("call-user", ({ to, callerInfo }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        callerInfo,
        callerSocketId: socket.id,
      });
    } else {
      socket.emit("call-failed", { reason: "User is offline" });
    }
  });

  socket.on("accept-call", ({ to }) => {
    const callerSocket = io.sockets.sockets.get(to);
    const callerId = callerSocket ? callerSocket.userId : null;
    const receiverId = socket.userId;
    const startTime = Date.now();

    activeCalls[socket.id] = {
      peerSocketId: to,
      callerId,
      receiverId,
      startTime,
    };
    activeCalls[to] = {
      peerSocketId: socket.id,
      callerId,
      receiverId,
      startTime,
    };

    io.to(to).emit("call-accepted", {
      receiverSocketId: socket.id,
    });
  });

  socket.on("reject-call", ({ to }) => {
    const callerSocket = io.sockets.sockets.get(to);
    const callerId = callerSocket ? callerSocket.userId : null;
    const receiverId = socket.userId;

    saveCallLog({
      senderId: callerId,
      receiverId,
      callStatus: "declined",
      callDuration: 0,
    });

    io.to(to).emit("call-rejected");
  });

  socket.on("cancel-call", ({ to }) => {
    saveCallLog({
      senderId: socket.userId,
      receiverId: to,
      callStatus: "missed",
      callDuration: 0,
    });

    const receiverSocketId = userSocketMap[to] || to;
    io.to(receiverSocketId).emit("call-cancelled");
  });

  socket.on("send-offer", ({ to, offer }) => {
    io.to(to).emit("receive-offer", {
      offer,
      senderSocketId: socket.id,
    });
  });

  socket.on("send-answer", ({ to, answer }) => {
    io.to(to).emit("receive-answer", {
      answer,
      senderSocketId: socket.id,
    });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", {
      candidate,
      senderSocketId: socket.id,
    });
  });

  socket.on("end-call", ({ to }) => {
    const peerSocketId = userSocketMap[to] || to;

    const callSession = activeCalls[socket.id];
    if (callSession) {
      const duration = Math.floor((Date.now() - callSession.startTime) / 1000);
      saveCallLog({
        senderId: callSession.callerId,
        receiverId: callSession.receiverId,
        callStatus: "completed",
        callDuration: duration,
      });

      delete activeCalls[socket.id];
      delete activeCalls[callSession.peerSocketId];
    }

    io.to(peerSocketId).emit("call-ended");
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];

    // clean up any active calls
    const callSession = activeCalls[socket.id];
    if (callSession) {
      const duration = Math.floor((Date.now() - callSession.startTime) / 1000);
      saveCallLog({
        senderId: callSession.callerId,
        receiverId: callSession.receiverId,
        callStatus: "completed",
        callDuration: duration,
      });

      io.to(callSession.peerSocketId).emit("call-ended");
      delete activeCalls[socket.id];
      delete activeCalls[callSession.peerSocketId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
