
import React, { useState, useRef } from 'react';
import { ProcessingState } from '../types';
import * as XLSX from 'xlsx';

interface Props {
  onProcess: (texts: string[]) => void;
  processingState: ProcessingState;
}

export const InputSection: React.FC<Props> = ({ onProcess, processingState }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = () => {
    if (!text.trim()) return;
    onProcess([text]);
    setText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
          
          // Flatten all cells and filter for strings that look like reviews
          const texts = rows.flat()
            .filter(cell => cell !== null && cell !== undefined)
            .map(cell => String(cell).trim())
            .filter(str => str.length > 10);

          if (texts.length > 0) {
            onProcess(texts);
          } else {
            alert("No valid feedback text found in the spreadsheet.");
          }
        } catch (err) {
          console.error("Excel processing error:", err);
          alert("Failed to process Excel file. Please ensure it's a valid .xlsx or .xls file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content) return;

        const lines = content
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 10);

        onProcess(lines);
      };
      reader.readAsText(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Understand Your <span className="text-indigo-600">Customers</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Instantly summarize and analyze sentiment. Paste individual reviews or upload bulk data via CSV or Excel.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Paste customer review</label>
            <textarea
              className="w-full h-48 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-800 placeholder-gray-400"
              placeholder="e.g. The service was slow but the staff was friendly..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={processingState.isProcessing}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePaste}
              disabled={processingState.isProcessing || !text.trim()}
              className="flex-grow px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center"
            >
              {processingState.isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing {processingState.current} / {processingState.total}...
                </span>
              ) : (
                'Analyze Paste'
              )}
            </button>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.csv,.xlsx,.xls"
                disabled={processingState.isProcessing}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processingState.isProcessing}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-indigo-400 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Bulk Upload (CSV, XLSX)</span>
              </button>
            </div>
          </div>

          {processingState.isProcessing && (
            <div className="mt-8 space-y-2">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(processingState.current / processingState.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {processingState.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <strong>Error:</strong> {processingState.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
