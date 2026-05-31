import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ImagePreviewModal from "./ImagePreviewModal";
import { Video, VideoOff, PhoneMissed, Trash2 } from "lucide-react";

const getCallLogDetails = (msg, authUserId) => {
  const isOutgoing = msg.senderId === authUserId;
  const durationStr = msg.callDuration
    ? ` (${Math.floor(msg.callDuration / 60).toString().padStart(2, "0")}:${(msg.callDuration % 60).toString().padStart(2, "0")})`
    : "";

  if (isOutgoing) {
    if (msg.callStatus === "missed" || msg.callStatus === "declined") {
      return {
        label: "Outgoing Video Call (No Answer)",
        icon: <VideoOff className="w-4 h-4 text-rose-450" />,
        colorClass: "text-slate-400 font-medium"
      };
    }
    return {
      label: `Outgoing Video Call${durationStr}`,
      icon: <Video className="w-4 h-4 text-cyan-400" />,
      colorClass: "text-cyan-400 font-medium"
    };
  } else {
    if (msg.callStatus === "missed" || msg.callStatus === "declined") {
      return {
        label: "Missed Video Call",
        icon: <PhoneMissed className="w-4 h-4 text-rose-500 animate-pulse" />,
        colorClass: "text-rose-500 font-semibold"
      };
    }
    return {
      label: `Incoming Video Call${durationStr}`,
      icon: <Video className="w-4 h-4 text-emerald-400" />,
      colorClass: "text-emerald-400 font-medium"
    };
  }
};

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  const handleDelete = (msgId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage(msgId);
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {(messages || []).length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isCall = msg.messageType === "call";
              const callDetails = isCall ? getCallLogDetails(msg, authUser._id) : null;

              return (
                <div
                  key={msg._id}
                  className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble relative max-w-[75%] md:max-w-[60%] break-words whitespace-pre-wrap overflow-hidden ${
                      isCall
                        ? "bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-slate-300 py-3 px-4 shadow-md rounded-2xl"
                        : msg.senderId === authUser._id
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {isCall ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-950/60 border border-slate-800/50 flex items-center justify-center shadow-inner flex-shrink-0">
                          {callDetails.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${callDetails.colorClass}`}>
                            {callDetails.label}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Shared"
                            className="rounded-lg h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewImage(msg.image)}
                          />
                        )}
                        {msg.text && <p className="mt-2">{msg.text}</p>}
                      </>
                    )}
                    <div className="flex items-center justify-between gap-4 mt-1.5 opacity-70">
                      <p className="text-[10px] flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {msg.senderId === authUser._id && (
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="hover:text-rose-500 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />

      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}

export default ChatContainer;
