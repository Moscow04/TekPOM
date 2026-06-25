'use client';
import { useEffect, useState } from 'react';
import { getAuthToken, tasks } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function BusinessAnalysisPage() {
  const [taskList, setTaskList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) return;
    tasks.list('?module=BUSINESS_ANALYSIS&limit=50').then((res: any) => setTaskList(res.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Business Analysis</h1>
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Tasks</h2>
              {taskList.map(t => <div key={t.id} className="text-sm border-b py-2">{t.title} <span className="text-xs text-gray-400">({t.status})</span></div>)}
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Deliverables</h2>
              <p className="text-sm text-gray-400">Reports, data models, and dashboards</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
