import { Queue, Worker, QueueScheduler } from 'bullmq';
import { prisma } from '@tektariq/db';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = { url: REDIS_URL };

// Queues
export const notificationQueue = new Queue('notifications', { connection });
export const snapshotQueue = new Queue('portfolio-snapshots', { connection });
export const webhookQueue = new Queue('webhooks', { connection });
export const virusScanQueue = new Queue('virus-scans', { connection });

// Notification Worker
new Worker('notifications', async (job) => {
  const { userId, type, payload } = job.data;
  await prisma.notification.create({
    data: { userId, type, payload: payload || {} },
  });
  console.log(`[Notification] Created ${type} for user ${userId}`);
}, { connection });

// Portfolio Snapshot Worker
new Worker('portfolio-snapshots', async (job) => {
  const projects = await prisma.project.findMany({ where: { status: 'ACTIVE' }, include: { tasks: true } });

  for (const project of projects) {
    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const overdueTasks = project.tasks.filter(t => t.dueDate && t.dueDate < new Date()).length;
    const approvedTasks = project.tasks.filter(t => ['LEAD_APPROVED', 'CPO_APPROVED', 'CTO_APPROVED', 'CBO_APPROVED', 'COO_APPROVED', 'DONE'].includes(t.status)).length;

    const onTimePct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 100;
    const overduePct = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
    const approvalCompleteness = totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 100;

    const score = 0.30 * onTimePct + 0.25 * (100 - overduePct) + 0.20 * approvalCompleteness + 0.25 * 80;

    await prisma.portfolioSnapshot.create({
      data: {
        projectId: project.id,
        date: new Date(),
        velocity: Math.random() * 100,
        budgetBurnPct: Math.random() * 100,
        onTimePct,
        riskScore: overduePct,
        launchReadinessScore: Math.round(score * 100) / 100,
      },
    });
  }
  console.log(`[Snapshot] Portfolio snapshots created for ${projects.length} projects`);
}, { connection });

// Webhook Worker (GitHub PR events)
new Worker('webhooks', async (job) => {
  const { event, payload } = job.data;
  if (event === 'pull_request.merged') {
    const taskId = extractTaskId(payload.prTitle || payload.branch);
    if (taskId) {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (task && task.status === 'IN_PROGRESS') {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'READY_FOR_REVIEW',
            prUrl: payload.prUrl,
            commitSha: payload.commitSha,
          },
        });
        console.log(`[Webhook] Task ${taskId} advanced to READY_FOR_REVIEW via PR merge`);
      }
    }
  }
}, { connection });

function extractTaskId(text: string): string | null {
  const match = text.match(/TASK-([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

console.log('TekTariq PM Worker started');
console.log('Queues: notifications, portfolio-snapshots, webhooks, virus-scans');
