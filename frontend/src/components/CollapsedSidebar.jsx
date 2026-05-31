import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useClerk } from "@clerk/react";
import { LogOutIcon, Volume2Icon, VolumeOffIcon, MessageCircle } from "lucide-react";

function CollapsedSidebar() {
  const { chats, getMyChatPartners, selectedUser, setSelectedUser, isSoundEnabled, toggleSound } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const { signOut } = useClerk();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  return (
    <div className="flex flex-col items-center h-full py-3 gap-2 overflow-y-auto overflow-x-hidden">
      {/* My own avatar at the top */}
      <div className="mb-2 relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-500">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt="me"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-800" />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-700/60 my-1 flex-shrink-0" />

      {/* Chat contact avatars */}
      <div className="flex flex-col gap-2 items-center flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none">
        {chats.map((chat) => {
          const isOnline = onlineUsers.includes(chat._id);
          const isSelected = selectedUser?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => setSelectedUser(chat)}
              title={chat.fullName}
              className={`relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden transition-all duration-200
                ${isSelected
                  ? "ring-2 ring-cyan-400 scale-110"
                  : "ring-2 ring-slate-600/50 hover:ring-cyan-500/60 hover:scale-105"
                }`}
            >
              <img
                src={chat.profilePic || "/avatar.png"}
                alt={chat.fullName}
                className="w-full h-full object-cover"
              />
              {/* Online indicator */}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-800" />
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-700/60 my-1 flex-shrink-0" />

      {/* Sound + Logout at bottom */}
      <div className="flex flex-col gap-3 items-center flex-shrink-0">
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isSoundEnabled ? <Volume2Icon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOutIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default CollapsedSidebar;
