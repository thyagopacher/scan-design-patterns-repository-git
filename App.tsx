
import React, { useState, useEffect } from 'react';
import { githubService } from './services/githubService';
import { geminiService } from './services/geminiService';
import { RepoAnalysisResult } from './types';
import SuggestionCard from './components/SuggestionCard';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepoAnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      setLoadingStep('Parsing GitHub URL...');
      const repoDetails = githubService.parseUrl(url);
      if (!repoDetails) {
        throw new Error('Invalid GitHub URL. Please use https://github.com/owner/repo format.');
      }

      setLoadingStep(`Fetching repository structure for ${repoDetails.owner}/${repoDetails.repo}...`);
      const files = await githubService.getRepoStructure(repoDetails.owner, repoDetails.repo);
      
      setLoadingStep('Architectural Analysis by Gemini AI (Thinking Deeply)...');
      const analysis = await geminiService.analyzeRepo(`${repoDetails.owner}/${repoDetails.repo}`, files);
      
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 bg-grid selection:bg-blue-500/30">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              P
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Pattern Scout
            </h1>
          </div>
          <div className="hidden md:flex gap-4">
             <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</a>
             <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Patterns Library</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
            Architecture Audit <br/> 
            <span className="text-blue-500">Driven by Intelligence</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Paste a GitHub repository URL and we'll identify where you're lacking Design Patterns. 
            Better code, better maintainability, fewer headaches.
          </p>

          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="https://github.com/facebook/react"
              className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder:text-slate-600 shadow-inner"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          </form>

          {loading && (
            <div className="mt-8 animate-pulse flex flex-col items-center">
              <div className="h-1 w-64 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/3 animate-[loading_2s_infinite]"></div>
              </div>
              <p className="mt-4 text-sm text-blue-400 font-mono uppercase tracking-widest">{loadingStep}</p>
            </div>
          )}

          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 max-w-3xl mx-auto flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 border-l-4 border-blue-500 pl-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Audit Results for <span className="text-blue-400">{result.repositoryName}</span>
              </h2>
              <p className="text-slate-400 max-w-4xl text-lg leading-relaxed">
                {result.summary}
              </p>
            </div>

            <div className="space-y-4">
              {result.suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
            
            {result.suggestions.length === 0 && (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500 text-lg">No major design pattern issues detected. Your architecture seems solid!</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Powered by Gemini 2.5 & Pattern Scout AI. Use responsibly for architectural guidance.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="h-8 w-px bg-slate-800"></span>
            <p className="text-slate-600 text-xs mt-2 uppercase tracking-tighter">&copy; 2024 Pattern Scout Labs</p>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default App;
