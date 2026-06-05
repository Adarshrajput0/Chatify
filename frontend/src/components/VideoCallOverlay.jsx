import { useEffect, useRef } from "react";
import { useCallStore } from "../store/useCallStore";
import { PhoneOff, Video, VideoOff, Mic, MicOff, Loader2, Phone, ShieldAlert } from "lucide-react";

function VideoCallOverlay() {
  const {
    callState,
    caller,
    receiver,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleAudio,
    toggleVideo,
    retryMedia,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => {
        console.error("Local video play failed:", err);
      });
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.error("Remote video play failed:", err);
      });
    }
  }, [remoteStream, callState]);

  if (callState === "idle") return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getCallingInfo = () => {
    if (callState === "calling") return receiver;
    if (callState === "ringing") return caller;
    return null;
  };

  const person = getCallingInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md md:p-4 animate-fadeIn">
      {/* 1. DIALING STATE */}
      {callState === "calling" && person && (
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            {/* Pulsating background waves */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse scale-125" />
            <img
              src={person.profilePic || "/avatar.png"}
              alt={person.fullName}
              className="relative w-32 h-32 rounded-full border-4 border-cyan-500 object-cover shadow-lg"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-100">{person.fullName}</h3>
            <p className="text-cyan-400 font-medium text-sm mt-1 animate-pulse">Calling...</p>
          </div>

          <button
            onClick={cancelCall}
            className="flex items-center justify-center w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg"
            title="Cancel Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 2. RINGING STATE */}
      {callState === "ringing" && person && (
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
            <img
              src={person.profilePic || "/avatar.png"}
              alt={person.fullName}
              className="relative w-32 h-32 rounded-full border-4 border-emerald-500 object-cover shadow-lg"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-100">{person.fullName}</h3>
            <p className="text-emerald-400 font-medium text-sm mt-1">Incoming Video Call...</p>
          </div>

          <div className="flex gap-8">
            <button
              onClick={rejectCall}
              className="flex items-center justify-center w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={acceptCall}
              className="flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg animate-bounce"
              title="Accept"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CONNECTING STATE */}
      {callState === "connecting" && (
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center space-y-4 text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          <p className="text-slate-200 font-medium text-lg">Connecting call...</p>
        </div>
      )}

      {/* 4. CONNECTED STATE */}
      {callState === "connected" && (
        <div className="w-full h-full md:max-w-4xl md:h-[650px] bg-slate-900/95 md:border md:border-slate-800 md:rounded-3xl overflow-hidden relative shadow-2xl flex flex-col justify-between">
          {/* Main Remote Video */}
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                <p className="text-slate-400">Waiting for peer...</p>
              </div>
            )}
          </div>

          {/* Floating Local Video */}
          <div className="absolute top-4 right-4 w-32 h-44 md:w-40 md:h-52 bg-slate-950 border-2 border-cyan-500/80 rounded-2xl overflow-hidden shadow-2xl z-10">
            {localStream && !isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-850 text-slate-400">
                <VideoOff className="w-8 h-8 opacity-50" />
                <span className="text-[10px] mt-1 opacity-70">Video Off</span>
              </div>
            )}
          </div>

          {/* Top Panel Overlay */}
          <div className="relative p-6 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start z-10">
            <div>
              <h4 className="text-white font-semibold text-lg drop-shadow-md">
                {receiver?.fullName || caller?.fullName || "Video Call"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-sm font-semibold drop-shadow-md">
                  Connected
                </span>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-slate-100 text-sm font-mono tracking-wider border border-slate-700/50 shadow-md">
              {formatTime(callDuration)}
            </div>
          </div>

          {/* Bottom Controls Overlay */}
          <div className="relative p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-6 z-10">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:scale-105 active:scale-95 shadow-md ${
                isMuted
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500/30"
                  : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="flex items-center justify-center w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
              title="Hang Up"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:scale-105 active:scale-95 shadow-md ${
                isVideoOff
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500/30"
                  : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80"
              }`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* 5. PERMISSION DENIED STATE */}
      {callState === "permission-denied" && (
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-100">Camera & Mic Access Blocked</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Chatify needs permission to access your camera and microphone to make video calls.
            </p>
            <div className="bg-slate-950/50 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2.5 mt-5 border border-slate-850/50">
              <p className="font-semibold text-slate-300">How to fix this:</p>
              <div className="flex gap-2">
                <span className="text-cyan-500 font-bold">1.</span>
                <span>Click the **lock** or **camera** icon in the browser address bar.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-500 font-bold">2.</span>
                <span>Toggle the Camera and Microphone settings to **Allow**.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-500 font-bold">3.</span>
                <span>Click **Try Again** below.</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full pt-2">
            <button
              onClick={endCall}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-medium text-sm border border-slate-700/50 active:scale-95"
            >
              Close
            </button>
            <button
              onClick={retryMedia}
              className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl transition-all font-semibold text-sm active:scale-95 shadow-lg shadow-cyan-500/10"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallOverlay;
