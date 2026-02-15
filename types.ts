
export type SentimentLabel = 'Positive' | 'Neutral' | 'Negative' | 'Critical';

export interface AnalysisResult {
  id: string;
  originalText: string;
  summary: string;
  sentiment: SentimentLabel;
  score: number; // 0 to 100
  keyIssues: string[];
  timestamp: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  total: number;
  current: number;
  error?: string;
}
