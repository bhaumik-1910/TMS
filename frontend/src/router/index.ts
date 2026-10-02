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

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('tms_access_token');
    const isPublic = to.meta.public === true || to.path === '/' || to.path === '/landing' || to.path === '/403';
    const isAuthRoute = to.path.startsWith('/auth');

    // Allow public marketing & error pages
    if (isPublic) {
      return next();
    }

    // If unauthenticated and accessing protected console route -> redirect to login
    if (!token && !isAuthRoute) {
      return next('/auth/login');
    }

    // If authenticated and visiting login -> redirect to console
    if (token && isAuthRoute) {
      return next('/dashboard');
    }

    // Permission Check
    const requiredPermission = to.meta.permission as string | undefined;
    if (token && requiredPermission) {
      const authStore = useAuthStore();
      const isAllowed = authStore.hasPermission(requiredPermission);

      if (!isAllowed) {
        return next('/403');
      }
    }

    next();
  });

  return Router;
});
