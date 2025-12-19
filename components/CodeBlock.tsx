
import React from 'react';

interface CodeBlockProps {
  title: string;
  code: string;
  variant: 'danger' | 'success';
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, code, variant }) => {
  const borderColor = variant === 'danger' ? 'border-red-500/50' : 'border-emerald-500/50';
  const bgColor = variant === 'danger' ? 'bg-red-500/5' : 'bg-emerald-500/5';
  const textColor = variant === 'danger' ? 'text-red-400' : 'text-emerald-400';

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} overflow-hidden flex flex-col h-full`}>
      <div className={`px-3 py-1.5 border-b ${borderColor} flex justify-between items-center`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>{title}</span>
      </div>
      <div className="p-4 flex-grow overflow-auto max-h-[400px]">
        <pre className="text-sm leading-relaxed text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
