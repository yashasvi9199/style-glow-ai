import React, { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, RotateCcw, X } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error(err);
    }
  }, []);

  // stop camera stream on unmount or cancel
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        onCapture(imageSrc);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md h-full md:h-auto md:aspect-[3/4] bg-black overflow-hidden md:rounded-2xl">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
            <p className="mb-4">{error}</p>
            <button 
              onClick={onCancel}
              className="px-4 py-2 bg-white text-black rounded-full"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
               <button 
                onClick={onCancel}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <X size={24} />
              </button>

              <button 
                onClick={capture}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>

              <button 
                onClick={() => {
                    stopCamera();
                    startCamera();
                }}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <RotateCcw size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};