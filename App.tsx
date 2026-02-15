
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { InputSection } from './components/InputSection';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { DetailView } from './components/DetailView';
import { AnalysisResult, ProcessingState } from './types';
import { analyzeReview } from './services/geminiService';

const App: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    total: 0,
    current: 0,
  });

  const handleProcess = useCallback(async (texts: string[]) => {
    setProcessingState({
      isProcessing: true,
      total: texts.length,
      current: 0,
      error: undefined,
    });

    const newResults: AnalysisResult[] = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const text = texts[i];
        const analysis = await analyzeReview(text);
        
        const result: AnalysisResult = {
          ...analysis,
          id: Math.random().toString(36).substr(2, 9),
          originalText: text,
          timestamp: Date.now(),
        };

        newResults.push(result);
        setProcessingState(prev => ({ ...prev, current: i + 1 }));
      } catch (err) {
        console.error(`Error processing review ${i}:`, err);
        setProcessingState(prev => ({ 
          ...prev, 
          error: `Failed to analyze some reviews. Last error: ${err instanceof Error ? err.message : 'Unknown error'}` 
        }));
        // We continue to next item even if one fails
      }
    }

    setResults(prev => [...newResults, ...prev]);
    setProcessingState(prev => ({ ...prev, isProcessing: false }));
  }, []);

  const handleClear = () => {
    setResults([]);
    setSelectedResult(null);
  };

  return (
    <Layout>
      {selectedResult ? (
        <DetailView 
          result={selectedResult} 
          onBack={() => setSelectedResult(null)} 
        />
      ) : results.length > 0 && !processingState.isProcessing ? (
        <AnalysisDashboard 
          results={results} 
          onSelectItem={setSelectedResult}
          onClear={handleClear}
        />
      ) : (
        <InputSection 
          onProcess={handleProcess} 
          processingState={processingState} 
        />
      )}
    </Layout>
  );
};

export default App;
