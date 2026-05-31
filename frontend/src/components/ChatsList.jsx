import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, unreadMessages } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={chat.profilePic || "/avatar.png"}
                  alt={chat.fullName}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-200 font-medium truncate">
                  {chat.fullName}
                </h4>
                {chat.lastMessage && (
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                    {new Date(chat.lastMessage.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                  {chat.lastMessage.messageType === "call" ? (
                    chat.lastMessage.callStatus === "missed" || chat.lastMessage.callStatus === "declined" ? (
                      <>
                        <span className="text-rose-500 text-xs">📞</span>
                        <span className="text-rose-500 font-medium">Missed call</span>
                      </>
                    ) : (
                      <>
                        <span className="text-cyan-500 text-xs">📹</span>
                        <span>Video call</span>
                      </>
                    )
                  ) : chat.lastMessage.image && !chat.lastMessage.text ? (
                    "📷 Photo"
                  ) : (
                    chat.lastMessage.text || ""
                  )}
                </p>
              )}
            </div>
            {unreadMessages[chat._id] > 0 && (
              <span className="badge badge-primary badge-sm font-bold">
                {unreadMessages[chat._id]}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
