'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAuthToken, projects, tasks } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken() || !id) return;
    Promise.all([
      projects.get(id as string),
      tasks.list(`?projectId=${id}&limit=50`),
    ]).then(([p, t]) => {
      setProject(p);
      setProjectTasks((t as any).data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><div className="p-8">Loading...</div></Layout>;
  if (!project) return <Layout><div className="p-8">Project not found</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <span className="text-sm text-gray-500">{project.status} · {projectTasks.length} tasks</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ New Task</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Tasks</h2>
            <div className="space-y-2">
              {projectTasks.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2 text-sm">
                  <div>
                    <span className="font-medium">{t.title}</span>
                    <span className="ml-2 text-xs text-gray-400">[{t.module}]</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold text-sm mb-2">Project Info</h2>
              <p className="text-sm">Status: {project.status}</p>
              <p className="text-sm">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold text-sm mb-2">Quick Actions</h2>
              <button className="w-full text-left text-sm text-blue-600 py-1 hover:underline">View Timeline</button>
              <button className="w-full text-left text-sm text-blue-600 py-1 hover:underline">View Risks</button>
              <button className="w-full text-left text-sm text-blue-600 py-1 hover:underline">Team Allocation</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
