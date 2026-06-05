import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

let audioCtx = null;
let toneInterval = null;

function playDialingTone() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const runDial = () => {
    if (!audioCtx || audioCtx.state === 'closed') return;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.frequency.value = 350;
    osc2.frequency.value = 440;
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime + 1.8);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    
    setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
      } catch (e) {}
    }, 2100);
  };
  
  runDial();
  toneInterval = setInterval(runDial, 4000);
}

function playRingtone() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const runRing = () => {
    if (!audioCtx || audioCtx.state === 'closed') return;
    
    const playChirp = (delay, freq) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.3);
    };
    
    playChirp(0, 880);
    playChirp(0.15, 880);
    playChirp(0.6, 880);
    playChirp(0.75, 880);
  };
  
  runRing();
  toneInterval = setInterval(runRing, 2000);
}

function stopTones() {
  if (toneInterval) {
    clearInterval(toneInterval);
    toneInterval = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (e) {}
    audioCtx = null;
  }
}

async function getUserMediaWithFallback() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Video calling is not supported in this environment. Make sure you are using a secure connection (HTTPS) or localhost.");
  }

  try {
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (error) {
    console.warn("Failed to get both video and audio, trying device detection fallback...", error);
    
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      throw new Error("Camera/Microphone permission denied. Please grant access in your browser settings.");
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((device) => device.kind === "videoinput");
      const hasAudio = devices.some((device) => device.kind === "audioinput");

      if (!hasVideo && !hasAudio) {
        throw new Error("No camera or microphone found on this device.");
      }

      const constraints = {
        video: hasVideo,
        audio: hasAudio,
      };

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (fallbackError) {
      console.error("Fallback getUserMedia failed:", fallbackError);
      throw error;
    }
  }
}

export const useCallStore = create((set, get) => {
  let pc = null;
  let candidateQueue = [];
  let timerInterval = null;

  return {
    callState: "idle", // "idle" | "calling" | "ringing" | "connecting" | "connected"
    caller: null,
    receiver: null,
    callerSocketId: null,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isVideoOff: false,
    callDuration: 0,

    startCall: async (receiverUser) => {
      const socket = useAuthStore.getState().socket;
      if (!socket) {
        toast.error("Socket not connected");
        return;
      }

      set({ 
        callState: "calling", 
        receiver: receiverUser, 
        caller: null, 
        isMuted: false, 
        isVideoOff: false,
        callDuration: 0 
      });

      playDialingTone();

      socket.emit("call-user", {
        to: receiverUser._id,
        callerInfo: useAuthStore.getState().authUser,
      });
    },

    acceptCall: async () => {
      const socket = useAuthStore.getState().socket;
      const { callerSocketId } = get();
      if (!socket || !callerSocketId) return;

      stopTones();
      set({ callState: "connecting" });

      try {
        const stream = await getUserMediaWithFallback();
        set({ localStream: stream });

        pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
            { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" }
          ],
        });

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          set((state) => {
            const currentStream = state.remoteStream || new MediaStream();
            currentStream.addTrack(event.track);
            return { remoteStream: currentStream, callState: "connected" };
          });
          get().startCallTimer();
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: callerSocketId,
              candidate: event.candidate,
            });
          }
        };

        socket.emit("accept-call", { to: callerSocketId });
      } catch (err) {
        console.error("Failed to get user media or create connection", err);
        if (err.name === "NotAllowedError" || err.message?.toLowerCase().includes("denied")) {
          set({ callState: "permission-denied" });
        } else {
          toast.error(err.message || "Camera/Microphone permission denied or not found");
          get().endCall();
        }
      }
    },

    retryMedia: async () => {
      const socket = useAuthStore.getState().socket;
      const { callerSocketId, receiver } = get();
      if (!socket || !callerSocketId) return;

      set({ callState: "connecting" });

      const isCaller = !!receiver;
      if (isCaller) {
        try {
          const stream = await getUserMediaWithFallback();
          set({ localStream: stream });

          pc = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
              { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" }
            ],
          });

          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });

          pc.ontrack = (event) => {
            set((state) => {
              const currentStream = state.remoteStream || new MediaStream();
              currentStream.addTrack(event.track);
              return { remoteStream: currentStream, callState: "connected" };
            });
            get().startCallTimer();
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                to: callerSocketId,
                candidate: event.candidate,
              });
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("send-offer", { to: callerSocketId, offer });
        } catch (err) {
          console.error("Failed to retry media as caller", err);
          if (err.name === "NotAllowedError" || err.message?.toLowerCase().includes("denied")) {
            set({ callState: "permission-denied" });
          } else {
            toast.error(err.message || "Camera/Microphone permission denied or not found");
            get().endCall();
          }
        }
      } else {
        get().acceptCall();
      }
    },

    rejectCall: () => {
      const socket = useAuthStore.getState().socket;
      const { callerSocketId } = get();
      if (socket && callerSocketId) {
        socket.emit("reject-call", { to: callerSocketId });
      }
      stopTones();
      get().resetCallState();
    },

    cancelCall: () => {
      const socket = useAuthStore.getState().socket;
      const { receiver } = get();
      if (socket && receiver) {
        socket.emit("cancel-call", { to: receiver._id });
      }
      stopTones();
      get().resetCallState();
    },

    endCall: () => {
      const socket = useAuthStore.getState().socket;
      const { receiver, caller, callerSocketId } = get();
      const peerId = receiver?._id || caller?._id || callerSocketId;
      if (socket && peerId) {
        socket.emit("end-call", { to: peerId });
      }
      get().resetCallState();
    },

    toggleAudio: () => {
      const { localStream, isMuted } = get();
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = isMuted;
        });
        set({ isMuted: !isMuted });
      }
    },

    toggleVideo: () => {
      const { localStream, isVideoOff } = get();
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoOff;
        });
        set({ isVideoOff: !isVideoOff });
      }
    },

    startCallTimer: () => {
      if (timerInterval) clearInterval(timerInterval);
      set({ callDuration: 0 });
      timerInterval = setInterval(() => {
        set((state) => ({ callDuration: state.callDuration + 1 }));
      }, 1000);
    },

    stopCallTimer: () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    },

    resetCallState: () => {
      stopTones();
      get().stopCallTimer();

      const { localStream } = get();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      if (pc) {
        try {
          pc.close();
        } catch (e) {}
        pc = null;
      }

      candidateQueue = [];

      set({
        callState: "idle",
        caller: null,
        receiver: null,
        callerSocketId: null,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isVideoOff: false,
        callDuration: 0,
      });
    },

    initCallListeners: (socket) => {
      if (!socket) return;

      socket.on("incoming-call", ({ callerInfo, callerSocketId }) => {
        set({
          callState: "ringing",
          caller: callerInfo,
          callerSocketId,
          receiver: null,
          isMuted: false,
          isVideoOff: false,
          callDuration: 0,
        });
        playRingtone();
      });

      socket.on("call-accepted", async ({ receiverSocketId }) => {
        stopTones();
        set({ callState: "connecting", callerSocketId: receiverSocketId });

        try {
          const stream = await getUserMediaWithFallback();
          set({ localStream: stream });

          pc = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          });

          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });

          pc.ontrack = (event) => {
            set((state) => {
              const currentStream = state.remoteStream || new MediaStream();
              currentStream.addTrack(event.track);
              return { remoteStream: currentStream, callState: "connected" };
            });
            get().startCallTimer();
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                to: receiverSocketId,
                candidate: event.candidate,
              });
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("send-offer", { to: receiverSocketId, offer });
        } catch (err) {
          console.error("Failed to get media or create offer", err);
          if (err.name === "NotAllowedError" || err.message?.toLowerCase().includes("denied")) {
            set({ callState: "permission-denied" });
          } else {
            toast.error(err.message || "Camera/Microphone permission denied or not found");
            get().endCall();
          }
        }
      });

      socket.on("receive-offer", async ({ offer, senderSocketId }) => {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("send-answer", { to: senderSocketId, answer });

          // Process queued ICE candidates
          while (candidateQueue.length > 0) {
            const cand = candidateQueue.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (err) {
          console.error("Error setting offer or sending answer", err);
        }
      });

      socket.on("receive-answer", async ({ answer }) => {
        if (!pc) return;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Process queued ICE candidates
          while (candidateQueue.length > 0) {
            const cand = candidateQueue.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (err) {
          console.error("Error setting remote answer description", err);
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (!candidate) return;
        try {
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            candidateQueue.push(candidate);
          }
        } catch (err) {
          console.error("Error adding ice candidate", err);
        }
      });

      socket.on("call-rejected", () => {
        stopTones();
        toast.error("Call declined");
        get().resetCallState();
      });

      socket.on("call-cancelled", () => {
        stopTones();
        toast.error("Call canceled by caller");
        get().resetCallState();
      });

      socket.on("call-failed", ({ reason }) => {
        stopTones();
        toast.error(reason || "Call failed");
        get().resetCallState();
      });

      socket.on("call-ended", () => {
        stopTones();
        toast("Call ended");
        get().resetCallState();
      });
    },

    cleanupCallListeners: (socket) => {
      if (!socket) return;
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-cancelled");
      socket.off("call-failed");
      socket.off("call-ended");
    },
  };
});
