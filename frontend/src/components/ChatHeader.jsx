import { XIcon, ArrowLeft, Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <button onClick={() => setSelectedUser(null)} className="mr-2">
          <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser.fullName}
          </h3>
          <p className="text-slate-400 text-sm">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button
        onClick={() => isOnline && startCall(selectedUser)}
        disabled={!isOnline}
        className={`p-2.5 rounded-full transition-all cursor-pointer shadow-md ${
          isOnline
            ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 hover:shadow-cyan-500/20"
            : "bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-50"
        }`}
        title={isOnline ? "Start Video Call" : "User is offline"}
      >
        <Video className="w-5 h-5" />
      </button>
    </div>
  );
}
export default ChatHeader;
