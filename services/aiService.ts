/**
 * AI Service
 * Fetches analysis from the backend API.
 */

import { AnalysisResult } from '../types';

// API Endpoint - Vercel serverless function
const API_URL = import.meta.env.VITE_API_URL || 'https://style-glow-api.vercel.app/api/analyze';

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
  try {
    // console.log('Calling API:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    // console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result: AnalysisResult = await response.json();
    // console.log('Analysis result received:', JSON.stringify(result, null, 2));
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
      details: {} as any,
      suggestions: {
        general: ["Enhance lighting", "Fix contrast", "Smooth skin"],
        clothing: ["Iron clothes", "Change color", "Add jacket"],
        pose: ["Straighten back", "Smile more", "Turn head"],
        background: ["Blur background", "Remove clutter", "Darken background"],
        hair: ["Add volume", "Tame frizz", "Change style"],
        skin: ["Remove shine", "Even tone", "Reduce redness"],
        makeup: ["Natural look", "Pop of color", "Define eyes"],
        lighting: ["Soften shadows", "Increase brightness", "Warm tone"],
        accessories: ["Add glasses", "Wear necklace", "Add hat"],
        expression: ["Softer smile", "Confident look", "Relax eyes"]
      },
      recaptureSuggestions: [
        "Try finding better lighting",
        "Smile more naturally",
        "Check your background for clutter"
      ],
      facialFeatures: {
        texture: "Unavailable",
        forehead: "Unavailable",
        eyes: "Unavailable",
        cheeks: "Unavailable"
      },
      emotionalAnalysis: {
        expression: "Unavailable",
        confidence: "Unavailable",
        approachability: "Unavailable",
        perceivedMood: "Unavailable"
      },
      aestheticEnhancements: {
        lighting: "Unavailable",
        angles: "Unavailable",
        glasses: "Unavailable",
        hairstyles: "Unavailable",
        grooming: "Unavailable"
      },
      skinWellness: {
        observations: "Unavailable",
        lifestyleFactors: "Unavailable",
        homeCare: "Unavailable",
        naturalIngredients: "Unavailable",
        professionalRecommendation: "Unavailable"
      }
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
