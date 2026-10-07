import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '../stores/auth';

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    const token = localStorage.getItem('tms_access_token');
    const isAuthRoute = to.path.startsWith('/auth') || to.path === '/login';
    const isPublic = to.meta.public === true || to.path === '/403';

    // If authenticated and visiting login -> redirect to console
    if (token && isAuthRoute) {
      return '/dashboard';
    }

    // Allow public pages (login, 403)
    if (isPublic) {
      return true;
    }

    // If unauthenticated and accessing protected console route -> redirect to login
    if (!token && !isAuthRoute) {
      return '/auth/login';
    }

    // Permission Check
    const requiredPermission = to.meta.permission as string | undefined;
    if (token && requiredPermission) {
      const authStore = useAuthStore();
      const isAllowed = authStore.hasPermission(requiredPermission);

      if (!isAllowed) {
        return '/403';
      }
    }

    return true;
  });

  return Router;
});
