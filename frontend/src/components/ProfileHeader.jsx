import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, Camera, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useClerk } from "@clerk/react";
const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const { signOut } = useClerk();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      setIsUploading(true);
      try {
        await updateProfile({ profilePic: base64Image });
      } finally {
        setIsUploading(false);
      }
    };
  };

  return (
    <div className="p-4 border-b border-slate-700/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* AVATAR with camera badge */}
          <div className="relative flex-shrink-0">
            <button
              className="size-12 rounded-full overflow-hidden block ring-2 ring-slate-600 hover:ring-cyan-500 transition-all"
              onClick={() => fileInputRef.current.click()}
              title="Change profile picture"
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
            </button>
            {/* Camera badge */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-0.5 -right-0.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full p-1 shadow-lg transition-colors"
              title="Change profile picture"
            >
              {isUploading ? (
                <Loader2 className="size-2.5 animate-spin" />
              ) : (
                <Camera className="size-2.5" />
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {/* USERNAME & ONLINE TEXT */}
          <div className="min-w-0 flex-1">
            <h3 className="text-slate-200 font-medium text-sm truncate">
              {authUser.fullName}
            </h3>
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Online
            </p>
          </div>
        </div>
        {/* BUTTONS */}

        <div className="flex gap-4 items-center">
          {/* LOGOUT BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => signOut()}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
