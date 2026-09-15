'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
  isAssistant?: boolean;
}

export default function MarkdownContent({ content, isAssistant = true }: MarkdownContentProps) {
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
                className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/50 hover:decoration-amber-400 transition-all bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
              >
                <span>{children}</span>
                <ExternalLink size={12} className="shrink-0 text-amber-400" />
              </a>
            );
          },
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 text-zinc-200">{children}</p>;
          },

          strong({ children }) {
            return (
              <strong className="font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return <em className="italic text-zinc-300">{children}</em>;
          },
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mt-4 mb-2 pb-1 border-b border-amber-500/20">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-bold text-amber-200 mt-3 mb-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-bold text-amber-300 mt-3 mb-1.5 flex items-center gap-1.5">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1.5 my-2.5 pl-1 text-zinc-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1.5 my-2.5 pl-1 text-zinc-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/60 shadow-lg backdrop-blur-md">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-amber-500/10 border-b border-zinc-800 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-zinc-800/60 text-zinc-300">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-amber-500/5 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-3 font-semibold text-amber-300">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2.5 text-zinc-300">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-amber-500/60 pl-4 py-1 italic text-zinc-400 bg-amber-500/5 rounded-r-lg my-2">
                {children}
              </blockquote>
            );
          },
          code({ children }) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 text-xs font-mono border border-zinc-700/50">
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
