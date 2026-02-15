
import React, { useMemo, useState } from 'react';
import { AnalysisResult, SentimentLabel } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';

interface Props {
  results: AnalysisResult[];
  onSelectItem: (result: AnalysisResult) => void;
  onClear: () => void;
}

type SortKey = 'sentiment' | 'score' | 'timestamp';
type SortDirection = 'asc' | 'desc';

const COLORS = {
  Positive: '#10b981', // green-500
  Neutral: '#6b7280',  // gray-500
  Negative: '#f97316', // orange-500
  Critical: '#ef4444', // red-500
};

const SENTIMENT_PRIORITY: Record<SentimentLabel, number> = {
  'Critical': 0,
  'Negative': 1,
  'Neutral': 2,
  'Positive': 3,
};

export const AnalysisDashboard: React.FC<Props> = ({ results, onSelectItem, onClear }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'timestamp',
    direction: 'desc',
  });
  const [scoreThreshold, setScoreThreshold] = useState<number>(0);

  const stats = useMemo(() => {
    const counts = results.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = results.length;
    // Explicitly cast Object.entries values to number to ensure arithmetic operations are permitted by the compiler
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value, 
      percentage: total > 0 ? (((value as number) / total) * 100).toFixed(1) + '%' : '0%'
    }));
  }, [results]);

  const avgScore = useMemo(() => {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(totalScore / results.length);
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(r => r.score >= scoreThreshold);
  }, [results, scoreThreshold]);

  const sortedResults = useMemo(() => {
    const sortableItems = [...filteredResults];
    sortableItems.sort((a, b) => {
      // Use explicit keyof to avoid potential index signature issues
      let aVal: any = a[sortConfig.key as keyof AnalysisResult];
      let bVal: any = b[sortConfig.key as keyof AnalysisResult];

      if (sortConfig.key === 'sentiment') {
        aVal = SENTIMENT_PRIORITY[a.sentiment];
        bVal = SENTIMENT_PRIORITY[b.sentiment];
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [filteredResults, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return (
      <svg className="w-3 h-3 ml-1 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5-5 5 5H5zM5 12l5 5 5-5H5z" /></svg>
    );
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 ml-1 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5 15l5-5 5 5H5z" /></svg>
    ) : (
      <svg className="w-3 h-3 ml-1 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5l5 5 5-5H5z" /></svg>
    );
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Sentiment', 'Score', 'Summary', 'Key Issues', 'Original Text'];
    const rows = results.map(r => [
      r.id,
      new Date(r.timestamp).toISOString(),
      r.sentiment,
      r.score,
      `"${r.summary.replace(/"/g, '""')}"`,
      `"${r.keyIssues.join('; ').replace(/"/g, '""')}"`,
      `"${r.originalText.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sentify_analysis_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sentify_analysis_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Overview</h1>
          <p className="text-gray-500">Insights from {results.length} records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </button>
          <button 
            onClick={exportToJSON}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            Export JSON
          </button>
          <button 
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Health Score</h3>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-bold text-gray-900">{avgScore}</span>
            <span className="text-gray-400 mb-1">/ 100</span>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${avgScore}%`,
                backgroundColor: avgScore > 70 ? COLORS.Positive : avgScore > 40 ? COLORS.Neutral : COLORS.Critical 
              }} 
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-72">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Sentiment Distribution (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: string, props: any) => [
                  `${value} items (${props.payload.percentage})`, 'Count'
                ]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as SentimentLabel] || '#8884d8'} />
                ))}
                <LabelList dataKey="percentage" position="top" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#64748b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Feedback Records</h3>
            <div className="text-xs text-gray-400 font-medium">Showing {filteredResults.length} of {results.length}</div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center whitespace-nowrap">
              Min Score: <span className="ml-2 text-indigo-600 w-6 text-center">{scoreThreshold}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={scoreThreshold} 
              onChange={(e) => setScoreThreshold(parseInt(e.target.value))}
              className="w-24 sm:w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            {scoreThreshold > 0 && (
              <button 
                onClick={() => setScoreThreshold(0)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th 
                  className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('sentiment')}
                >
                  <div className="flex items-center">
                    Sentiment {getSortIcon('sentiment')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase"
                >
                  Summary
                </th>
                <th 
                  className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center justify-end">
                    Score {getSortIcon('score')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center justify-end">
                    Date {getSortIcon('timestamp')}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedResults.length > 0 ? sortedResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      style={{ 
                        backgroundColor: `${COLORS[result.sentiment]}10`, 
                        color: COLORS[result.sentiment],
                        borderColor: `${COLORS[result.sentiment]}30`
                      }}
                    >
                      {result.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 relative has-tooltip">
                    <p className="text-sm text-gray-900 line-clamp-1 max-w-md cursor-help">{result.summary}</p>
                    
                    {/* Tooltip for Key Issues */}
                    <div className="issue-tooltip absolute z-50 left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white rounded-lg text-xs shadow-xl pointer-events-none">
                      <div className="font-bold mb-1 text-indigo-300 uppercase tracking-tighter">Key Issues:</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {result.keyIssues.slice(0, 3).map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                        {result.keyIssues.length > 3 && <li>+ {result.keyIssues.length - 3} more...</li>}
                      </ul>
                      <div className="absolute left-6 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono font-medium text-gray-700">{result.score}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onSelectItem(result)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      <p className="font-medium">No results match your current filter.</p>
                      <button 
                        onClick={() => setScoreThreshold(0)}
                        className="mt-2 text-indigo-600 hover:underline text-sm font-semibold"
                      >
                        Clear score filter
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
