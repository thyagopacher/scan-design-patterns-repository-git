
import React, { useState } from 'react';
import { githubService } from './services/githubService';
import { geminiService } from './services/geminiService';
import { scannerService, LocalFinding } from './services/scannerService';
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
        throw new Error('Invalid GitHub URL. Use format: https://github.com/owner/repo');
      }

      setLoadingStep(`Analyzing Repository Structure...`);
      const files = await githubService.getRepoStructure(repoDetails.owner, repoDetails.repo);
      
      setLoadingStep('Running Local Pattern Scanner (Code Heuristics)...');
      // Limit files to analyze to avoid excessive API calls or delays
      const topFiles = files.filter(f => !f.path.includes('.test.')).slice(0, 8);
      
      const allFindings: LocalFinding[] = [];
      
      for (const file of topFiles) {
        setLoadingStep(`Scanning: ${file.path}...`);
        const content = await githubService.getFileContent(repoDetails.owner, repoDetails.repo, file.path);
        if (content) {
          const findings = scannerService.analyzeCodeLocally(file.path, content);
          allFindings.push(...findings);
        }
      }

      if (allFindings.length === 0) {
        setLoadingStep('No obvious patterns detected locally. Asking AI for deep architectural insights...');
      } else {
        setLoadingStep(`Found ${allFindings.length} candidates! Generating refactoring blueprints...`);
      }

      const analysis = await geminiService.analyzeWithContext(
        `${repoDetails.owner}/${repoDetails.repo}`, 
        allFindings
      );
      
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Check your network or URL.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 bg-grid selection:bg-blue-500/30">
      <nav className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Pattern Scanner <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full ml-2">V2.0</span>
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
            Identify Patterns <br/> 
            <span className="text-indigo-500">From Real Code</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Our local engine scans your source code for structural signatures, 
            then uses AI to draft professional refactoring blueprints.
          </p>

          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., https://github.com/expressjs/express"
              className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600 shadow-inner"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Scanning...' : 'Analyze Codebase'}
            </button>
          </form>

          {loading && (
            <div className="mt-8 flex flex-col items-center">
              <div className="h-1 w-64 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-indigo-500 w-full animate-[loading_1.5s_infinite]"></div>
              </div>
              <p className="text-sm text-indigo-400 font-mono uppercase tracking-widest">{loadingStep}</p>
            </div>
          )}

          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 max-w-3xl mx-auto text-sm">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/20">
              <h2 className="text-2xl font-bold text-white mb-2">Analysis: {result.repositoryName}</h2>
              <p className="text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            <div className="space-y-6">
              {result.suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
