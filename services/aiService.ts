/**
 * AI Service
 * Fetches analysis from the backend API.
 */

import { AnalysisResult } from '../types';
import { compressImage, getBase64Size } from '../utils/imageCompression';

// API Endpoint - Vercel serverless function
const API_URL = import.meta.env.VITE_API_URL || 'https://style-glow-api.vercel.app/api/analyze';

// API timeout in milliseconds (Gemini can take 20-40s)
const API_TIMEOUT = 60000; // 60 seconds

/**
 * Callback type for user notifications
 */
export type NotificationCallback = (message: string, type: 'info' | 'warning' | 'error') => void;

/**
 * Analyze image using the backend API
 */
export const analyzeImage = async (
  base64Image: string,
  onNotification?: NotificationCallback
): Promise<AnalysisResult> => {
  const startTime = Date.now();
  
  // Client-side Rate Limiting (Spam Protection)
  const RATE_LIMIT_WINDOW = 3 * 60 * 1000; // 3 minutes
  const MAX_REQUESTS = 1;
  
  try {
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    const now = Date.now();
    
    // Filter out old requests
    const recentRequests = history.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - recentRequests[0])) / 1000);
      const minutes = Math.floor(waitTime / 60);
      const seconds = waitTime % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      throw new Error(`Please wait ${timeStr} before analyzing another image.`);
    }

    // Compress image before sending to API (reduces payload size & API processing time)
    const originalSize = getBase64Size(base64Image);
    console.log(`[AI Service] Original image size: ${originalSize.toFixed(2)} KB`);
    
    const compressedImage = await compressImage(base64Image, 1024, 1024, 0.80);
    const compressedSize = getBase64Size(compressedImage);
    console.log(`[AI Service] Compressed to: ${compressedSize.toFixed(2)} KB (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% reduction)`);
    
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

      ================ SUMMARY ================
      "s": One polished ~20-word sentence highlighting the strongest visible qualities (composition, lighting, pose, expression). 
      Must be positive but technical, not flattering.

      ================ GENERAL SUGGESTIONS ================
      "g": Exactly 3 items, each formatted as "Observation = Action". 
      Short (6–12 words), technical, image-specific (e.g., “Flat cheek shadows = raise fill light slightly.”).
      No repetition.

      ================ DETAILED ANALYSIS ================
      Each "d.*" = one clear 10–16 word sentence with a specific improvement point, no reused ideas.
      • gen: overall compositional balance, framing, or proportional clarity.
      • clo: clothing fit, color harmony, and visual coherence with scene.
      • pos: posture, shoulder angle, head tilt, silhouette strength.
      • bkg: background separation, clutter, depth, subject-to-background contrast.
      • har: hair texture, grooming, flyaways, shape framing the face.
      • ski: visible tone, texture, marks, or unevenness (non-medical).
      • lig: lighting direction, highlight/shadow placement, exposure accuracy.
      • exp: expression clarity, micro-smile cues, authenticity, eye engagement.

      ================ RECAPTURE ================
      "r": Provide 5–7 simple beginner-friendly commands (6-14 words).
      Direct physical guidance only (no jargon). 
      Examples of tone: 
      “Raise camera slightly for cleaner jawline.” 
      “Turn shoulders softly for contour.” 
      “Step forward to reduce background overlap.” 
      “Lean in slightly for stronger presence.”

      ================ EMOTION & SOCIAL ================
      Each field = one vivid 8–15 word sentence using ONLY visible cues (eyes, brows, mouth tension, posture).
      • emo: emotional tone inferred from micro-expressions and facial energy.
      • app: approachability based on warmth signals, gaze direction, facial softness.
      • conf: must include “low”, “medium”, or “high” and a brief visible justification in 1 line.
      • mood: overall emotional atmosphere combining expression, posture, and visual energy.
      No single-word answers; no psychological diagnosis.

      ================ WELLNESS (4 Remedies) ================
      "w": Exactly 4 remedies for clearly visible facial skin issues only.
      Allowed: acne, pimples, post-acne marks, dark circles, tanning, hyperpigmentation, redness, pores, dryness, uneven tone, mild dullness.
      If ambiguous due to lighting, use “Possible <Issue>”.

      For each remedy:
      • title: literal issue name (no creative names).
      • description: 2–3 lines with purpose + method + frequency. Must be topical, safe, practical, and Indian/Ayurvedic friendly.
      • ingredients: comma-separated STRING of topical items.
      • No ingredient repetition across remedies.
      • Severe cases → description: “Visible severe issue — advise medical consultation.” and ingredients = "".

      ================ OUTPUT RULES ================
      • Output MUST be valid JSON matching the structure.  
      • No markdown, no comments, no extra text.
      • Every sentence must be image-grounded, concise, and specific.
    `;
    
    // Helper for delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Retry logic with model fallback
    const makeRequest = async (modelName: string, attempt: number = 1): Promise<Response> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: compressedImage,
            prompt: prompt,
            model: modelName // Send model preference to backend
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

    let response;
    try {
      // Attempt 1: Primary Model
      response = await makeRequest('gemini-2.5-flash');
    } catch (error: any) {
      if (error.message.includes('503')) {
        if (onNotification) onNotification('AI busy, retrying in 2s...', 'info');
        await delay(2000);
        
        try {
          // Attempt 2: Retry Primary
          response = await makeRequest('gemini-2.5-flash', 2);
        } catch (error2: any) {
          if (error2.message.includes('503')) {
            if (onNotification) onNotification('Still busy, retrying in 4s...', 'info');
            await delay(4000);
            
            try {
              // Attempt 3: Fallback Model
              if (onNotification) onNotification('Switching to backup AI model...', 'warning');
              response = await makeRequest('gemini-2.0-flash', 3);
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
    
    // Map short keys to readable interface
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
      disclaimerText: "The content provided here is for informational and creative improvement purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
      tokenUsage: rawResult.tokenUsage
    };

    // Update history on success
    recentRequests.push(now);
    localStorage.setItem('analysis_history', JSON.stringify(recentRequests));
    
    // Increment analysis counter for category rotation (lightweight, no token bloat)
    const analysisCount = parseInt(localStorage.getItem('analysis_count') || '0');
    localStorage.setItem('analysis_count', (analysisCount + 1).toString());
    console.log(`[AI Service] Analysis count: ${analysisCount + 1}`);
    
    const totalTime = Date.now() - startTime;
    console.log(`[AI Service] Total analysis time: ${(totalTime / 1000).toFixed(2)}s`);
    if (result.tokenUsage) {
      console.log(`[AI Service] Tokens used: ${result.tokenUsage.totalTokens} (prompt: ${result.tokenUsage.promptTokens}, response: ${result.tokenUsage.responseTokens})`);
    }
    
    return result;

  } catch (error: any) {
    console.error('Analysis failed:', error);
    
    // Re-throw specific errors to be handled by UI
    throw new Error(error.message || 'AI analysis failed');
  }
};

/**
 * Check API availability
 */
export const checkAIAvailability = async (): Promise<{
  api: boolean;
}> => {
  try {
    // Simple health check or just assume true if endpoint exists
    // For now, we'll just return true as the real check happens during analysis
    return { api: true };
  } catch {
    return { api: false };
  }
};
