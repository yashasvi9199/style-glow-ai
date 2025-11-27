export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS'
}

export interface DetailedAnalysis {
  // 18 Point Checklist
  subjectClarity: string;
  lightingQuality: string;
  skinTones: string;
  facialShadowsAndTexture: string;
  eyes: string;
  expressionAndPosture: string;
  composition: string;
  backgroundQuality: string;
  colorHarmony: string;
  contrastAndTonalBalance: string;
  sharpness: string;
  croppingAndAspectRatio: string;
  clothingAndStyling: string;
  moodConsistency: string;
  noiseAndGrain: string;
  detailHierarchy: string;
  lensDistortion: string;
  intent: string;
  
  // Specific extras
  hairstyle: string;
  makeup: string;
}

export interface CategorySuggestions {
  general: string[];
  clothing: string[];
  pose: string[];
  background: string[];
  hair: string[];
  skin: string[];
  makeup: string[];
  lighting: string[];
  accessories: string[];
  expression: string[];
}

export interface AnalysisResult {
  summary: string;
  details: DetailedAnalysis;
  suggestions: CategorySuggestions; // Structured suggestions per category
  recaptureSuggestions: string[]; // Specific advice for retaking the photo
}



export interface StorageConfig {
  provider: 'cloudinary';
  cloudName: string;
  uploadPreset: string;
  enabled: boolean;
}
