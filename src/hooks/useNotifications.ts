import { useMemo } from 'react';
import { useChecklist } from '@/context/ChecklistContext';
import { allChecklistItems, teamMembers, accessRequests } from '@/data/mockData';
import type { User } from '@/types/onboarding';

export interface AppNotification {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'access_granted' | 'access_pending' | 'overdue' | 'completed' | 'team_overdue' | 'team_progress';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function useNotifications(user: User): AppNotification[] {
  const { items } = useChecklist();

  return useMemo(() => {
    const notifications: AppNotification[] = [];
    const now = new Date();

    if (user.role === 'employee' || user.role === 'manager') {
      // Employee notifications from their own checklist items
      const userItems = items;

      // Access granted notifications
      const grantedRequests = accessRequests.filter(ar => ar.status === 'complete');
      grantedRequests.forEach(ar => {
        notifications.push({
          id: `granted-${ar.id}`,
          title: `${ar.systemName} Access granted`,
          time: timeAgo(ar.updatedAt),
          read: true,
          type: 'access_granted',
        });
      });

      // Pending access notifications
      const pendingRequests = accessRequests.filter(ar => ar.status === 'pending' || ar.status === 'in_progress');
      pendingRequests.forEach(ar => {
        notifications.push({
          id: `pending-${ar.id}`,
          title: `${ar.systemName} Access pending approval`,
          time: timeAgo(ar.createdAt),
          read: false,
          type: 'access_pending',
        });
      });

      // Overdue items
      const overdueItems = userItems.filter(i => i.status !== 'complete' && new Date(i.dueDate) < now);
      overdueItems.slice(0, 3).forEach(item => {
        notifications.push({
          id: `overdue-${item.id}`,
          title: `"${item.title}" is overdue`,
          time: timeAgo(item.dueDate),
          read: false,
          type: 'overdue',
        });
      });

      // Recently completed
      const completed = userItems.filter(i => i.status === 'complete');
      completed.slice(0, 2).forEach(item => {
        notifications.push({
          id: `done-${item.id}`,
          title: `"${item.title}" completed`,
          time: timeAgo(item.updatedAt),
          read: true,
          type: 'completed',
        });
      });
    }

    if (user.role === 'manager') {
      // Manager-specific: team overdue items
      teamMembers.forEach(member => {
        const memberItems = allChecklistItems.filter(i => i.userId === member.id);
        const overdueCount = memberItems.filter(i => i.status !== 'complete' && new Date(i.dueDate) < now).length;
        if (overdueCount > 0) {
          notifications.push({
            id: `team-overdue-${member.id}`,
            title: `${member.name} has ${overdueCount} overdue item${overdueCount > 1 ? 's' : ''}`,
            time: 'Now',
            read: false,
            type: 'team_overdue',
          });
        }
      });

      // Team progress milestones
      teamMembers.forEach(member => {
        const memberItems = allChecklistItems.filter(i => i.userId === member.id);
        const completedPct = memberItems.length ? Math.round((memberItems.filter(i => i.status === 'complete').length / memberItems.length) * 100) : 0;
        if (completedPct >= 50 && completedPct < 100) {
          notifications.push({
            id: `team-progress-${member.id}`,
            title: `${member.name} is ${completedPct}% through onboarding`,
            time: 'Recently',
            read: true,
            type: 'team_progress',
          });
        }
      });
    }

    if (user.role === 'admin') {
      // Admin: aggregate team stats
      const totalOverdue = allChecklistItems.filter(i => i.status !== 'complete' && new Date(i.dueDate) < now).length;
      if (totalOverdue > 0) {
        notifications.push({
          id: 'admin-overdue',
          title: `${totalOverdue} overdue items across all employees`,
          time: 'Now',
          read: false,
          type: 'team_overdue',
        });
      }
      const totalMembers = teamMembers.length;
      notifications.push({
        id: 'admin-active',
        title: `${totalMembers} employees currently onboarding`,
        time: 'Now',
        read: true,
        type: 'team_progress',
      });
    }

    // Sort: unread first, then by type priority
    return notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return 0;
    });
  }, [items, user]);
}
