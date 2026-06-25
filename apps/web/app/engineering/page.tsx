'use client';
import { useEffect, useState } from 'react';
import { getAuthToken, tasks } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

const disciplines = ['ALL', 'FRONTEND', 'BACKEND', 'CLOUD_DEVOPS', 'QA'];

export default function EngineeringPage() {
  const [taskList, setTaskList] = useState<any[]>([]);
  const [discipline, setDiscipline] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) return;
    tasks.list(`?module=ENGINEERING${discipline !== 'ALL' ? `&discipline=${discipline}` : ''}&limit=50`)
      .then((res: any) => setTaskList(res.data || [])).finally(() => setLoading(false));
  }, [discipline]);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Engineering Board</h1>
        <div className="flex gap-2 mb-4">
          {disciplines.map(d => (
            <button key={d} onClick={() => setDiscipline(d)} className={`px-3 py-1 rounded-md text-sm ${d === discipline ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{d}</button>
          ))}
        </div>
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-5 gap-3">
            {['BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE'].map(status => (
              <div key={status} className="bg-gray-50 border rounded-lg p-3 min-h-[200px]">
                <h3 className="font-semibold text-xs mb-2 uppercase text-gray-500">{status.replace(/_/g, ' ')}</h3>
                {taskList.filter(t => t.status === status).map(t => (
                  <div key={t.id} className="bg-white border rounded p-2 mb-2 text-xs shadow-sm">{t.title}</div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
