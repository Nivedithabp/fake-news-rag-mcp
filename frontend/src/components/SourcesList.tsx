'use client';

import { Source } from '@/app/page';

interface SourcesListProps {
  sources: Source[];
}

export function SourcesList({ sources }: SourcesListProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sources</h3>
      
      <div className="space-y-4">
        {sources.map((source, index) => (
          <div
            key={`${source.docId}-${source.chunkIndex}`}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Source {index + 1}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    source.label === 'fake' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {source.label === 'fake' ? 'Fake News' : 'Real News'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Score: {(source.score * 100).toFixed(1)}%
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {source.title}
                </h4>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {source.snippet}
                </p>
                
                {source.url && (
                  <div className="mt-2">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-800 underline"
                    >
                      View original article →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {sources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2">No sources found</p>
        </div>
      )}
    </div>
  );
}
