'use client';

import { IndexStatus } from '@/app/ingest/page';

interface StatusCardProps {
  status: IndexStatus | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function StatusCard({ status, loading, error, onRefresh }: StatusCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Index Status</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {loading && !status && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {status && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className={`mt-1 text-sm font-semibold ${
                status.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {status.status}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Documents</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                {status.totalDocuments.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Provider</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                {status.provider}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Collection</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {status.collection}
              </dd>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Environment</h4>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Environment:</dt>
                <dd className="text-gray-900">{status.environment.nodeEnv}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Embedding Provider:</dt>
                <dd className="text-gray-900">{status.environment.embeddingProvider}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Embedding Model:</dt>
                <dd className="text-gray-900">{status.environment.embeddingModel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Completion Model:</dt>
                <dd className="text-gray-900">{status.environment.completionModel}</dd>
              </div>
            </dl>
          </div>

          <div className="text-xs text-gray-500">
            Last updated: {new Date(status.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
