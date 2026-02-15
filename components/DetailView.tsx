
import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
  onBack: () => void;
}

const COLORS = {
  Positive: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Neutral: 'text-gray-600 bg-gray-50 border-gray-200',
  Negative: 'text-orange-600 bg-orange-50 border-orange-200',
  Critical: 'text-red-600 bg-red-50 border-red-200',
};

export const DetailView: React.FC<Props> = ({ result, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analysis Result</h2>
            <p className="text-gray-500 text-sm">{new Date(result.timestamp).toLocaleString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border text-lg font-bold ${COLORS[result.sentiment]}`}>
            {result.sentiment}
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Executive Summary</h3>
            <p className="text-xl text-gray-800 font-medium leading-relaxed italic">
              "{result.summary}"
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Key Issues Identified</h3>
              <ul className="space-y-2">
                {result.keyIssues.map((issue, i) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3" />
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sentiment Score</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-grow bg-gray-100 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <span className="text-2xl font-bold text-gray-900">{result.score}%</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                A higher score indicates more positive sentiment.
              </p>
            </section>
          </div>

          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Original Feedback</h3>
            <div className="max-h-60 overflow-y-auto text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.originalText}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
