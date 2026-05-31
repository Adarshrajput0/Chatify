import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useCallStore } from "./store/useCallStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";
import VideoCallOverlay from "./components/VideoCallOverlay";
import { useAuth } from "@clerk/react";
import { axiosInstance } from "./lib/axios";

function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { checkAuth, logout, isCheckingAuth, authUser, socket } = useAuthStore();
  const { initCallListeners, cleanupCallListeners } = useCallStore();

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

  // Show loader while Clerk is loading or while we are checking auth with the backend
  if (!isLoaded || isCheckingAuth) return <PageLoader />;

  return (
    <div className="h-screen w-screen bg-slate-900 relative overflow-hidden">
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
              <div className="w-full max-w-5xl px-4">
                <LoginPage />
              </div>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!authUser ? (
              <div className="w-full max-w-5xl px-4">
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

