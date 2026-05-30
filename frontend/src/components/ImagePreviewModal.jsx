import { XIcon, DownloadIcon } from "lucide-react";
import { useEffect } from "react";

function ImagePreviewModal({ imageUrl, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `chatify-image-${Date.now()}.jpg`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-slate-800/70 hover:bg-slate-700 transition-colors"
          title="Download image"
        >
          <DownloadIcon className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800/70 hover:bg-slate-700 transition-colors"
          title="Close"
        >
          <XIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Image */}
      <img
        src={imageUrl}
        alt="Full preview"
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default ImagePreviewModal;
