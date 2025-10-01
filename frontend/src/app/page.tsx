'use client';

import { useState } from 'react';
import { QueryBox } from '@/components/QueryBox';
import { ResultCard } from '@/components/ResultCard';
import { SourcesList } from '@/components/SourcesList';

export interface Source {
  docId: string;
  chunkIndex: number;
  score: number;
  snippet: string;
  label: string;
  title: string;
  url?: string;
}

export interface QueryResult {
  answer: string;
  sources: Source[];
  rawModelResponse: string;
  query: string;
  topK: number;
  timestamp: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/mcp-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'mcp.invoke',
          params: {
            tool: 'mcp.rag.query',
            params: {
              query: queryText,
              topK: 4
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Unknown error');
      }

      setResult(data.result);
      setQuery('');
    } catch (err) {
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Fake vs Real News RAG
        </h1>
        <p className="text-lg text-gray-600">
          Ask questions about news articles and get AI-powered answers with source citations
        </p>
      </div>

      <div className="space-y-6">
        <QueryBox
          query={query}
          setQuery={setQuery}
          onQuery={handleQuery}
          loading={loading}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <>
            <ResultCard result={result} />
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowSources(!showSources)}
                className="btn-secondary flex items-center space-x-2"
              >
                <span>{showSources ? 'Hide' : 'Show'} Sources</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showSources ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showSources && <SourcesList sources={result.sources} />}
          </>
        )}
      </div>
    </div>
  );
}
