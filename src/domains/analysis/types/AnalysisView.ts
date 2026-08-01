import { AnalysisResult } from '../../shared/types';

export interface AnalysisViewProps {
  imageSrc: string;
  analysis: AnalysisResult;
  onRetake: () => void;
  rateLimitRemaining: number;
}
