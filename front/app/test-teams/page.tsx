'use client';

import { useQuery } from '@apollo/client/react';
import { TeamsDocument, MeDocument } from '@/generated/graphql';

export default function TestPage() {
  const { data: meData, loading: meLoading, error: meError } = useQuery(MeDocument);
  const { data: teamsData, loading: teamsLoading, error: teamsError } = useQuery(TeamsDocument);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔧 Test GraphQL Queries</h1>

      {/* Test Me Query */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Query: me</h2>
        
        {meLoading && <p>Loading...</p>}
        {meError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <pre className="text-sm">{JSON.stringify(meError, null, 2)}</pre>
          </div>
        )}
        {meData && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">Success! User data:</p>
            <pre className="text-sm mt-2">{JSON.stringify(meData.me, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Test Teams Query */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Query: teams</h2>
        
        {teamsLoading && <p>Loading...</p>}
        {teamsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <pre className="text-sm">{JSON.stringify(teamsError, null, 2)}</pre>
          </div>
        )}
        {teamsData && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">Success! Teams data:</p>
            <p>Number of teams: {teamsData.teams?.length || 0}</p>
            <pre className="text-sm mt-2 max-h-96 overflow-auto">
              {JSON.stringify(teamsData.teams, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Environment Info */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
        <ul className="space-y-2 text-sm">
          <li><strong>GraphQL URL:</strong> {process.env.NEXT_PUBLIC_SCHEMA_URL || 'Not set'}</li>
          <li><strong>User Role:</strong> {meData?.me?.role || 'Unknown'}</li>
          <li><strong>User ID:</strong> {meData?.me?.id || 'Unknown'}</li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/dashboard/teams'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Go to Teams Page
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
