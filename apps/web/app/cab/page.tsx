'use client';
import { useEffect, useState } from 'react';
import { getAuthToken, cab } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function CABPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) return;
    cab.changeRequests().then((res: any) => setRequests(res.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Change Advisory Board</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ New Request</button>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Change Requests</h2>
          {loading ? <p>Loading...</p> : requests.length === 0 ? <p className="text-sm text-gray-400">No change requests</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b"><th className="pb-2">Description</th><th className="pb-2">Type</th><th className="pb-2">Status</th></tr></thead>
              <tbody>{requests.map((r: any) => <tr key={r.id} className="border-b"><td className="py-2">{r.description?.substring(0, 50)}</td><td className="py-2">{r.type}</td><td className="py-2"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{r.status}</span></td></tr>)}</tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
