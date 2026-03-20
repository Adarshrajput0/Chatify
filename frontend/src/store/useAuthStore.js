import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  // checkAuth: async () => {
  //   try {
  //     const res = await axiosInstance.get("/auth/check");
  //     set({ authUser: res.data });

  //     get().connectSocket();
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //     console.log("Error in authCheck:", error);
  //     set({ authUser: null });
  //   } finally {
  //     set({ isCheckingAuth: false });
  //   }
  // },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      get().connectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Not authenticated";

      console.log("Error in authCheck:", message);

      set({ authUser: null }); // VERY IMPORTANT
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // signup: async (data) => {
  //   set({ isSigningUp: true });
  //   try {
  //     const res = await axiosInstance.post("/auth/signup", data);
  //     set({ authUser: res.data });

  //     toast.success("Account created successfully!");
  //     get().connectSocket();
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   } finally {
  //     set({ isSigningUp: false });
  //   }
  // },

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });

      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Signup failed";

      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      // get().connectSocket();
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },
}));
