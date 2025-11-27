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

export interface FacialFeatureAnalysis {
  texture: string;
  forehead: string;
  eyes: string;
  cheeks: string;
}

export interface EmotionalSocialAnalysis {
  expression: string;
  confidence: string;
  approachability: string;
  perceivedMood: string;
}

export interface AestheticEnhancements {
  lighting: string;
  angles: string;
  glasses: string;
  hairstyles: string;
  grooming: string; // Beard/No-beard
}

export interface SkinWellnessAdvisor {
  observations: string;
  lifestyleFactors: string;
  homeCare: string;
  naturalIngredients: string;
  professionalRecommendation: string;
}

export interface AnalysisResult {
  summary: string;
  details: DetailedAnalysis;
  suggestions: CategorySuggestions; // Structured suggestions per category
  recaptureSuggestions: string[]; // Specific advice for retaking the photo
  
  // New Features
  facialFeatures?: FacialFeatureAnalysis;
  emotionalAnalysis?: EmotionalSocialAnalysis;
  aestheticEnhancements?: AestheticEnhancements;
  skinWellness?: SkinWellnessAdvisor;
}



export interface StorageConfig {
  provider: 'cloudinary';
  cloudName: string;
  uploadPreset: string;
  enabled: boolean;
}
