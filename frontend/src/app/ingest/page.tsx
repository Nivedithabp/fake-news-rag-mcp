'use client';

import { useState, useEffect } from 'react';
import { StatusCard } from '@/components/StatusCard';
import { IngestControls } from '@/components/IngestControls';

export interface IndexStatus {
  status: string;
  provider: string;
  collection: string;
  totalDocuments: number;
  timestamp: string;
  environment: {
    nodeEnv: string;
    embeddingProvider: string;
    embeddingModel: string;
    completionModel: string;
  };
}

export default function IngestPage() {
  const [status, setStatus] = useState<IndexStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

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
            tool: 'mcp.index.status',
            params: {}
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

      setStatus(data.result);
    } catch (err) {
      console.error('Status fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleIngest = async (force: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

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
            tool: 'mcp.index.ingest',
            params: { force }
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

      // Refresh status after successful ingestion
      await fetchStatus();
    } catch (err) {
      console.error('Ingest error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear the index? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
            tool: 'mcp.index.clear',
            params: {}
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

      // Refresh status after clearing
      await fetchStatus();
    } catch (err) {
      console.error('Clear error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Admin Panel
        </h1>
        <p className="text-lg text-gray-600">
          Manage the news dataset index and monitor system status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCard
          status={status}
          loading={loading}
          error={error}
          onRefresh={fetchStatus}
        />

        <IngestControls
          onIngest={handleIngest}
          onClear={handleClear}
          loading={loading}
          disabled={!status}
        />
      </div>
    </div>
  );
}
