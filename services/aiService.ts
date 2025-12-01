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
    
    const prompt = `You are an expert fashion photographer, stylist, and wellness advisor. Analyze this image and return STRICT JSON only (no markdown, no preamble).

STYLE RULES:
• Write 1-2 concise sentences per field (4-12 words each)
• Be specific, actionable, technical - avoid vague terms like "nice" or "good"
• No repetition between fields

JSON STRUCTURE:
{
  "s": "Summary - Brief positive analysis combining top 2-3 visual aspects (1 sentence, ~20 words)",
  "g": ["Suggestion 1", "Suggestion 2", "Suggestion 3"] - Format as "Observation = Action" (e.g., "Under-eye shadows = Soften with diffused light"),
  "d": {
    "gen": "General - Overall composition & framing insights",
    "clo": "Clothing - Style, fit, color, coordination analysis",
    "pos": "Pose - Body positioning, angles, posture assessment",
    "bkg": "Background - Setting, clutter, depth, context review",
    "har": "Hair - Style, grooming, texture, color evaluation",
    "ski": "Skin - Tone analysis, visible care needs (non-diagnostic)",
    "lig": "Lighting - Direction, quality, shadows, highlights critique",
    "exp": "Expression - Facial emotion, eye contact, authenticity"
  },
  "r": ["Tip 1", "Tip 2", ...] - 5-7 beginner-friendly recapture instructions. Use short imperatives (e.g., "Hold camera slightly higher", "Step back from wall"),
  "e": {
    "emo": "Expression - Emotional reading as face analyst",
    "app": "Approachability - Social warmth perception",
    "conf": "low" | "medium" | "high" - Confidence assessment,
    "mood": "Mood - Perceived emotional state"
  },
  "w": [
    {"title": "Issue Name (e.g., Acne, Dark Circles, Dryness)", "description": "Specific natural remedy instruction", "ingredients": "List of ingredients used"},
    ... 4 remedies based on VISIBLE SKIN ISSUES detected in the image.
    
    STRICT RULES:
    1. **DIAGNOSE & PRESCRIBE**: Identify 4 distinct skin needs/issues from the image (e.g., dullness, acne, tanning, dark circles, pores, dryness).
    2. **TITLE FORMAT**: The 'title' MUST be the name of the skin issue (e.g., "Acne Control", "Dark Circle Relief", "Glow Boost", "Tan Removal").
    3. **SKIN CARE ONLY**: Do NOT suggest remedies for hair, digestion, or general health.
    4. **VARIETY**: Use diverse Indian/Ayurvedic ingredients. Avoid repeating the same ingredients across remedies.
  ]
}

Provide rich, insightful content in each field while keeping sentences short and actionable.`;
    
    // API call with timeout protection
    const apiPromise = fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: compressedImage,
        prompt: prompt
      }),
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('API request timeout - please try again')), API_TIMEOUT)
    );

    const response = await Promise.race([apiPromise, timeoutPromise]);

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

  } catch (error) {
    console.error('Analysis failed:', error);
    
    if (onNotification) {
      onNotification(
        'AI analysis unavailable. Please try again.',
        'error'
      );
    }
    
    // Return fallback data
    return {
      summary: "AI analysis temporarily unavailable. Please try again.",
      details: {
        general: "Unavailable",
        clothing: "Unavailable",
        pose: "Unavailable",
        background: "Unavailable",
        hair: "Unavailable",
        skin: "Unavailable",
        lighting: "Unavailable",
        expression: "Unavailable"
      },
      suggestions: [
        "Enhance lighting", 
        "Fix contrast", 
        "Smooth skin"
      ],
      recaptureSuggestions: [
        "Try finding better lighting",
        "Smile more naturally",
        "Check your background for clutter"
      ],
      emotionalAnalysis: {
        expression: "Unavailable",
        confidence: "Unavailable",
        approachability: "Unavailable",
        perceivedMood: "Unavailable"
      },
      skinWellness: [
        {
          title: "Hydration Boost",
          description: "Drink more water and use a moisturizer.",
          ingredients: "Water, Moisturizer"
        },
        {
          title: "Sleep Well",
          description: "Ensure you get 7-8 hours of sleep.",
          ingredients: "Sleep"
        },
        {
          title: "Sun Protection",
          description: "Apply sunscreen daily.",
          ingredients: "Sunscreen"
        }
      ],
      disclaimerText: "The content provided here is for informational and creative improvement purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."
    };
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
