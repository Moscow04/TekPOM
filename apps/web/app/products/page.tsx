'use client';
import { useEffect, useState } from 'react';
import { getAuthToken, tasks } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function ProductsPage() {
  const [taskList, setTaskList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) return;
    tasks.list('?module=PRODUCT&limit=50').then((res: any) => setTaskList(res.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Product Module</h1>
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-4 gap-4">
            {['DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'LEAD_APPROVED', 'DONE'].map(status => (
              <div key={status} className="bg-gray-50 border rounded-lg p-3">
                <h3 className="font-semibold text-sm mb-2">{status.replace(/_/g, ' ')}</h3>
                {taskList.filter(t => t.status === status).map(t => (
                  <div key={t.id} className="bg-white border rounded p-2 mb-2 text-sm shadow-sm">{t.title}</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
