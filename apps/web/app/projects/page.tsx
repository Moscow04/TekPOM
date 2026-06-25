'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, projects } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function ProjectsPage() {
  const router = useRouter();
  const [projectList, setProjectList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) { router.push('/login'); return; }
    projects.list().then((res: any) => setProjectList(res.data || [])).finally(() => setLoading(false));
  }, [router]);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <button onClick={() => {/* open create modal */}} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">+ New Project</button>
        </div>
        {loading ? <p>Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectList.map((p: any) => (
              <div key={p.id} onClick={() => router.push(`/projects/${p.id}`)} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                <h3 className="font-semibold">{p.name}</h3>
                <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : p.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                {p.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
