import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'OPERATIONS' | 'SYSTEM' | 'WARNING' | 'INFO' | string;
  channel?: string;
  isRead: boolean;
  createdAt: string;
  organizationId?: string;
  userId?: string;
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([]);
  const loading = ref(false);
  const isRefreshing = ref(false);
  let pollTimer: any = null;

  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);
  const criticalCount = computed(() =>
    notifications.value.filter((n) => (n.type || '').toUpperCase() === 'CRITICAL' && !n.isRead).length
  );
  const operationsCount = computed(() =>
    notifications.value.filter((n) => (n.type || '').toUpperCase() === 'OPERATIONS' && !n.isRead).length
  );
  const systemCount = computed(() =>
    notifications.value.filter((n) => (n.type || '').toUpperCase() === 'SYSTEM' && !n.isRead).length
  );

  async function fetchNotifications(silent = false) {
    if (!silent) loading.value = true;
    else isRefreshing.value = true;

    try {
      const res: any = await api.get('/api/v1/notifications');
      const list = res.data || res;
      if (Array.isArray(list)) {
        notifications.value = list;
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      loading.value = false;
      isRefreshing.value = false;
    }
  }

  async function markAsRead(id: string) {
    const item = notifications.value.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
    }
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  async function markAllAsRead() {
    notifications.value.forEach((n) => (n.isRead = true));
    try {
      await api.patch('/api/v1/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }

  async function deleteNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
    try {
      await api.delete(`/api/v1/notifications/${id}`);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }

  async function clearRead() {
    notifications.value = notifications.value.filter((n) => !n.isRead);
    try {
      await api.delete('/api/v1/notifications/clear-read');
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
    }
  }

  function startPolling(intervalMs = 25000) {
    stopPolling();
    fetchNotifications(true);
    pollTimer = setInterval(() => {
      fetchNotifications(true);
    }, intervalMs);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  return {
    notifications,
    loading,
    isRefreshing,
    unreadCount,
    criticalCount,
    operationsCount,
    systemCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
    startPolling,
    stopPolling,
  };
});
