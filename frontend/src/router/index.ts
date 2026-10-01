import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

router.beforeEach((to, from, next) => {
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

export default router;
