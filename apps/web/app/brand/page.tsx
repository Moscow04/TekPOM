'use client';
import { useEffect, useState } from 'react';
import { getAuthToken, tasks } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function BrandPage() {
  const [taskList, setTaskList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) return;
    tasks.list('?module=BRAND&limit=50').then((res: any) => setTaskList(res.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Brand Module</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Asset Library</h2>
            <p className="text-sm text-gray-400">Browse finalized brand assets</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">My Tasks</h2>
            {loading ? <p className="text-sm">Loading...</p> : taskList.length === 0 ? <p className="text-sm text-gray-400">No brand tasks</p> : (
              <ul className="space-y-2">{taskList.map(t => <li key={t.id} className="text-sm border-b pb-1">{t.title} <span className="text-xs text-gray-400">({t.status})</span></li>)}</ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
