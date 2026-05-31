import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5002" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],
  _getTokenFn: null, // Clerk's getToken function, stored so socket can refresh it

  // Called from App.jsx after Clerk confirms user is signed in
  checkAuth: async (token, getTokenFn) => {
    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    try {
      // Store the Clerk getToken function for later use (socket reconnects)
      set({ _getTokenFn: getTokenFn });

      // Attach the Clerk token to all future axios requests
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    // Clean up axios header and socket — Clerk handles the actual sign-out
    delete axiosInstance.defaults.headers.common["Authorization"];
    get().disconnectSocket();
    set({ authUser: null, isCheckingAuth: false });
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error?.response?.data?.message || "Update failed");
    }
  },

  connectSocket: () => {
    const { authUser, _getTokenFn } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      // Use a function so Socket.io fetches a fresh token on EVERY connection attempt (including reconnects)
      auth: async (cb) => {
        try {
          const freshToken = _getTokenFn ? await _getTokenFn() : null;
          cb({ token: freshToken });
        } catch {
          cb({ token: null });
        }
      },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null });
  },
}));

