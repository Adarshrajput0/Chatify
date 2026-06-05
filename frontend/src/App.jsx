import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useCallStore } from "./store/useCallStore";
import { useEffect, useState } from "react";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";
import VideoCallOverlay from "./components/VideoCallOverlay";
import { useAuth } from "@clerk/react";
import { axiosInstance } from "./lib/axios";

function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { checkAuth, logout, isCheckingAuth, authUser, socket } = useAuthStore();
  const [clerkTimedOut, setClerkTimedOut] = useState(false);
  const { initCallListeners, cleanupCallListeners } = useCallStore();

  // If Clerk hasn't loaded in 10s (bad publishable key / network issue), show error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) setClerkTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Sync Clerk session → backend session
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      getToken().then((token) => {
        checkAuth(token, getToken); // pass getToken so socket can always get a fresh token
      });
    } else {
      logout();
    }
  }, [isLoaded, isSignedIn]);

  // Refresh the axios Authorization header every 55 seconds to keep the token fresh
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(async () => {
      const token = await getToken();
      if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    }, 55 * 1000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  useEffect(() => {
    if (socket) {
      initCallListeners(socket);
      return () => cleanupCallListeners(socket);
    }
  }, [socket, initCallListeners, cleanupCallListeners]);

  // Show error if Clerk timed out (likely a bad publishable key in production)
  if (clerkTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white gap-4">
        <p className="text-2xl font-bold text-red-400">⚠ Authentication Failed</p>
        <p className="text-slate-400 text-center max-w-sm">
          The authentication service could not be reached. This is usually caused by a missing or
          invalid <code className="text-pink-400">VITE_CLERK_PUBLISHABLE_KEY</code> environment variable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show loader while Clerk is loading or while we are checking auth with the backend
  if (!isLoaded || isCheckingAuth) return <PageLoader />;

  return (
    <div className="h-[100dvh] w-screen bg-slate-900 relative overflow-hidden">
      {/* Background decorators */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={authUser ? <ChatPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? (
              <div className="w-full h-full md:max-w-5xl md:px-4 flex items-center justify-center">
                <LoginPage />
              </div>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? (
              <div className="w-full h-full md:max-w-5xl md:px-4 flex items-center justify-center">
                <SignUpPage />
              </div>
            ) : <Navigate to="/" />}
          />
        </Routes>
      </div>
      <Toaster />
      <VideoCallOverlay />
    </div>
  );
}

export default App;

