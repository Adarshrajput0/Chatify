import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ChatContainer from "../components/ChatContainer";
import CollapsedSidebar from "../components/CollapsedSidebar";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  const isCollapsed = !!selectedUser; // collapse on desktop when chat is open

  return (
    <div className="relative w-full h-full flex items-center justify-center md:p-4">
      <div className="w-full h-full md:max-w-6xl md:h-[calc(100dvh-2rem)]">
        <BorderAnimatedContainer>

          {/* ── COLLAPSED ICON RAIL (desktop only, when chat is open) ── */}
          {isCollapsed && (
            <div className="hidden md:flex flex-col bg-slate-800/70 backdrop-blur-sm border-r border-slate-700/30 w-[72px] flex-shrink-0">
              <CollapsedSidebar />
            </div>
          )}

          {/* ── FULL SIDEBAR (desktop when no chat, always on mobile when no chat) ── */}
          <div
            className={`
              flex-col bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/30
              transition-all duration-300 ease-in-out
              ${isCollapsed
                ? "hidden"                              // hide on desktop when collapsed; mobile hides chat panel instead
                : "flex w-full md:w-[340px] md:flex-shrink-0"}
            `}
          >
            <ProfileHeader />
            <ActiveTabSwitch />
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </div>

          {/* ── RIGHT CHAT PANEL ── */}
          <div
            className={`
              flex-col bg-slate-900/50 backdrop-blur-sm flex-1 min-w-0
              ${selectedUser ? "flex" : "hidden md:flex"}
            `}
          >
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>

        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChatPage;
