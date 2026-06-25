'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, tasks, projects, notifications as notifApi } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';

export default function DashboardPage() {
  const router = useRouter();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) { router.push('/login'); return; }
    Promise.all([
      tasks.list('?assigneeId=me&limit=10'),
      projects.list('?limit=10'),
      notifApi.list('?unreadOnly=true&limit=5'),
    ]).then(([t, p, n]) => {
      setMyTasks((t as any).data || []);
      setMyProjects((p as any).data || []);
      setNotifs((n as any).data || []);
    }).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase">My Tasks</h2>
            <p className="text-3xl font-bold text-blue-600">{myTasks.length}</p>
            <p className="text-xs text-gray-400 mt-1">Assigned to you</p>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Active Projects</h2>
            <p className="text-3xl font-bold text-green-600">{myProjects.length}</p>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase">Unread Notifications</h2>
            <p className="text-3xl font-bold text-orange-600">{notifs.length}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-3">My Tasks</h2>
            {myTasks.length === 0 ? <p className="text-gray-400 text-sm">No tasks assigned</p> : (
              <ul className="space-y-2">
                {myTasks.map((t: any) => (
                  <li key={t.id} className="text-sm flex justify-between items-center border-b pb-2">
                    <span>{t.title}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-3">Recent Notifications</h2>
            {notifs.length === 0 ? <p className="text-gray-400 text-sm">No unread notifications</p> : (
              <ul className="space-y-2">
                {notifs.map((n: any) => (
                  <li key={n.id} className="text-sm border-b pb-2">{n.type}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
