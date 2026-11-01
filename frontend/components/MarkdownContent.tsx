'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
  isAssistant?: boolean;
  theme?: 'light' | 'dark';
}

export default function MarkdownContent({ content, isAssistant = true, theme = 'light' }: MarkdownContentProps) {
  const isLight = theme === 'light';

  return (
    <div className="markdown-body space-y-2 text-xs sm:text-sm leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-semibold underline underline-offset-4 transition-all px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'text-amber-800 hover:text-amber-950 bg-amber-100/90 border-amber-300 decoration-amber-600/50 hover:decoration-amber-800'
                    : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border-amber-500/20 decoration-amber-500/50 hover:decoration-amber-400'
                }`}
              >
                <span>{children}</span>
                <ExternalLink size={12} className={`shrink-0 ${isLight ? 'text-amber-800' : 'text-amber-400'}`} />
              </a>
            );
          },
          p({ children }) {
            return <p className={`mb-2.5 last:mb-0 ${isLight ? 'text-slate-900 font-normal' : 'text-zinc-200'}`}>{children}</p>;
          },

          strong({ children }) {
            return (
              <strong className={`font-bold ${isLight ? 'text-amber-900 font-semibold' : 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.15)]'}`}>
                {children}
              </strong>
            );
          },
          em({ children }) {
            return <em className={`italic ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>{children}</em>;
          },
          h1({ children }) {
            return (
              <h1 className={`text-xl font-bold mt-4 mb-2 pb-1 border-b ${
                isLight
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-950 border-amber-300'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 border-amber-500/20'
              }`}>
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className={`text-lg font-bold mt-3 mb-2 ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className={`text-base font-bold mt-3 mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return <ul className={`list-disc list-inside space-y-1.5 my-2.5 pl-1 ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>{children}</ul>;
          },
          ol({ children }) {
            return <ol className={`list-decimal list-inside space-y-1.5 my-2.5 pl-1 ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          table({ children }) {
            return (
              <div className={`my-4 overflow-x-auto rounded-xl border shadow-lg backdrop-blur-md ${
                isLight ? 'border-slate-200 bg-white/95' : 'border-zinc-800 bg-zinc-950/60'
              }`}>
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
                isLight ? 'bg-amber-100/90 border-slate-200 text-amber-950' : 'bg-amber-500/10 border-zinc-800 text-amber-300'
              }`}>
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-zinc-800/60 text-zinc-300'}`}>{children}</tbody>;
          },
          tr({ children }) {
            return <tr className={`transition-colors ${isLight ? 'hover:bg-amber-50/60' : 'hover:bg-amber-500/5'}`}>{children}</tr>;
          },
          th({ children }) {
            return <th className={`px-4 py-3 font-semibold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>{children}</th>;
          },
          td({ children }) {
            return <td className={`px-4 py-2.5 ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className={`border-l-2 pl-4 py-1 italic rounded-r-lg my-2 ${
                isLight
                  ? 'border-amber-600 text-slate-700 bg-amber-50/80'
                  : 'border-amber-500/60 text-zinc-400 bg-amber-500/5'
              }`}>
                {children}
              </blockquote>
            );
          },
          code({ children }) {
            return (
              <code className={`px-1.5 py-0.5 rounded text-xs font-mono border ${
                isLight
                  ? 'bg-slate-100 text-amber-900 border-slate-300'
                  : 'bg-zinc-800 text-amber-300 border-zinc-700/50'
              }`}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
