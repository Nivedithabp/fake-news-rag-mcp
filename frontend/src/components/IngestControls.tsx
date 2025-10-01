'use client';

import { useState } from 'react';

interface IngestControlsProps {
  onIngest: (force: boolean) => void;
  onClear: () => void;
  loading: boolean;
  disabled: boolean;
}

export function IngestControls({ onIngest, onClear, loading, disabled }: IngestControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Index Management</h3>

      <div className="space-y-4">
        <div>
          <button
            onClick={() => onIngest(false)}
            disabled={loading || disabled}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Ingest Dataset'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Download and process the Kaggle dataset into the vector database
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary w-full"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <button
                onClick={() => onIngest(true)}
                disabled={loading || disabled}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Force Re-ingest'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Clear existing data and re-ingest (use with caution)
              </p>
            </div>

            <div>
              <button
                onClick={onClear}
                disabled={loading || disabled}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Clear Index'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Remove all data from the vector database
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Instructions</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Ensure the Kaggle dataset is downloaded and preprocessed</li>
                  <li>Click "Ingest Dataset" to process and index the data</li>
                  <li>Monitor the status to confirm successful ingestion</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
