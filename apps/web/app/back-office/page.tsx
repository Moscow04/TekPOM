'use client';
import { useEffect, useState } from 'react';
import { getAuthToken, backOffice } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function BackOfficePage() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) return;
    backOffice.portfolio().then(setPortfolio).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Back Office</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Portfolio Overview</h2>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-3">
                {portfolio.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between border-b pb-2">
                    <div><span className="font-medium">{p.name}</span><span className="ml-2 text-xs text-gray-400">{p.status}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4"><h2 className="font-semibold mb-2">Admin Console</h2><p className="text-sm text-gray-400">Users · Settings · Integrations</p></div>
            <div className="bg-white border rounded-lg p-4"><h2 className="font-semibold mb-2">Audit Log</h2><p className="text-sm text-gray-400">View system activity</p></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
