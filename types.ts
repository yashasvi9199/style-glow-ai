export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS'
}

export interface DetailedAnalysis {
  general: string;
  clothing: string;
  pose: string;
  background: string;
  hair: string;
  skin: string;
  lighting: string;
  expression: string;
}

export interface EmotionalSocialAnalysis {
  expression: string;
  confidence: string;
  approachability: string;
  perceivedMood: string;
}

export interface WellnessRemedy {
  title: string;
  description: string;
  ingredients: string;
}

export interface AnalysisResult {
  summary: string;
  details: DetailedAnalysis;
  suggestions: string[]; // General suggestions (g)
  recaptureSuggestions: string[]; // (r)
  
  emotionalAnalysis?: EmotionalSocialAnalysis; // (e)
  skinWellness?: WellnessRemedy[]; // (w)
  
  tokenUsage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  disclaimerText?: string; // (disc)
}



export interface StorageConfig {
  provider: 'cloudinary';
  cloudName: string;
  uploadPreset: string;
  enabled: boolean;
}
