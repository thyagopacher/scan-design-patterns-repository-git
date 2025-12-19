
import React from 'react';
import { DesignPatternSuggestion } from '../types';
import CodeBlock from './CodeBlock';

interface SuggestionCardProps {
  suggestion: DesignPatternSuggestion;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-blue-400 mb-1 flex items-center gap-2">
            <span className="p-1 bg-blue-500/10 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            {suggestion.patternName}
          </h3>
          <p className="text-slate-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Target: <code className="text-blue-300/80">{suggestion.targetFile}</code>
          </p>
        </div>
      </div>

      <p className="text-slate-300 mb-8 leading-relaxed italic bg-slate-950/50 p-4 rounded-lg border-l-4 border-blue-500">
        &ldquo;{suggestion.reasoning}&rdquo;
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CodeBlock title="Current (Spaghetti / Anti-pattern)" code={suggestion.codeBefore} variant="danger" />
        <CodeBlock title="Optimized (With Pattern Applied)" code={suggestion.codeAfter} variant="success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-500/5 rounded-xl p-5 border border-emerald-500/20">
          <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Key Benefits
          </h4>
          <ul className="space-y-2">
            {suggestion.benefits.map((benefit, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 italic">
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/20">
          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Trade-offs / Drawbacks
          </h4>
          <ul className="space-y-2">
            {suggestion.drawbacks.map((drawback, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 italic">
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></span>
                {drawback}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
