import { AnalysisResult } from '../../shared/types';
import { compressImage, getBase64Size } from '../../shared/utils/imageCompression';

const API_URL = import.meta.env.VITE_API_URL || 'https://style-glow-api.vercel.app/api/analyze';
const API_TIMEOUT = 60000;

export type NotificationCallback = (message: string, type: 'info' | 'warning' | 'error') => void;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (compressedImage: string, prompt: string, modelName: string): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: compressedImage,
        prompt: prompt,
        model: modelName
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.status === 503) {
      throw new Error('503 Service Unavailable');
    }
    
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const analyzeImage = async (
  base64Image: string,
  onNotification?: NotificationCallback
): Promise<AnalysisResult> => {
  const startTime = Date.now();
  const RATE_LIMIT_WINDOW = 3 * 60 * 1000;
  const MAX_REQUESTS = 1;
  
  try {
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    const now = Date.now();
    const recentRequests = history.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - recentRequests[0])) / 1000);
      const minutes = Math.floor(waitTime / 60);
      const seconds = waitTime % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      throw new Error(`Please wait ${timeStr} before analyzing another image.`);
    }

    const originalSize = getBase64Size(base64Image);
    const compressedImage = await compressImage(base64Image, 1024, 1024, 0.80);
    const compressedSize = getBase64Size(compressedImage);
    
    const prompt = `Analyze the image as a photographer, stylist, lighting expert, expression analyst, and skin wellness advisor. 
      Return STRICT JSON ONLY matching this structure (no text outside JSON):
      {
        "s": "",
        "g": ["","",""],
        "d": { "gen":"", "clo":"", "pos":"", "bkg":"", "har":"", "ski":"", "lig":"", "exp":"" },
        "r": ["","","","",""],
        "e": { "emo":"", "app":"", "conf":"", "mood":"" },
        "w": [
          {"title":"","description":"","ingredients":""},
          {"title":"","description":"","ingredients":""},
          {"title":"","description":"","ingredients":""},
          {"title":"","description":"","ingredients":""}
        ]
      }
      Check GUIDE/changelogs for formatting rules.`;

    let response;
    try {
      response = await makeRequest(compressedImage, prompt, 'gemini-2.5-flash');
    } catch (error: any) {
      if (error.message.includes('503')) {
        if (onNotification) onNotification('AI busy, retrying in 2s...', 'info');
        await delay(2000);
        try {
          response = await makeRequest(compressedImage, prompt, 'gemini-2.5-flash');
        } catch (error2: any) {
          if (error2.message.includes('503')) {
            if (onNotification) onNotification('Still busy, retrying in 4s...', 'info');
            await delay(4000);
            try {
              if (onNotification) onNotification('Switching to backup AI model...', 'warning');
              response = await makeRequest(compressedImage, prompt, 'gemini-2.0-flash');
            } catch (error3) {
              throw new Error('AI Service Overloaded. Please try again later.');
            }
          } else {
            throw error2;
          }
        }
      } else {
        throw error;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const rawResult = await response.json();
    const result: AnalysisResult = {
      summary: rawResult.s,
      suggestions: rawResult.g,
      details: {
        general: rawResult.d.gen,
        clothing: rawResult.d.clo,
        pose: rawResult.d.pos,
        background: rawResult.d.bkg,
        hair: rawResult.d.har,
        skin: rawResult.d.ski,
        lighting: rawResult.d.lig,
        expression: rawResult.d.exp
      },
      recaptureSuggestions: rawResult.r,
      emotionalAnalysis: {
        expression: rawResult.e.emo,
        approachability: rawResult.e.app,
        confidence: rawResult.e.conf,
        perceivedMood: rawResult.e.mood
      },
      skinWellness: rawResult.w,
      disclaimerText: "The content provided here is for informational and creative improvement purposes only.",
      tokenUsage: rawResult.tokenUsage
    };

    recentRequests.push(now);
    localStorage.setItem('analysis_history', JSON.stringify(recentRequests));
    
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'AI analysis failed');
  }
};
