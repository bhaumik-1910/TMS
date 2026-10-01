import axios, { AxiosError } from 'axios';
import { useAppNotify } from '../composables/useAppNotify';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tms_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const orgContext = localStorage.getItem('tms_org_context');
  if (orgContext && config.headers) {
    config.headers['x-organization-context'] = orgContext;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If backend envelope is { success: true, data: ... }
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  async (error: AxiosError<any>) => {
    const notify = useAppNotify();

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || 'A network or server error occurred.';

      if (status === 401) {
        localStorage.removeItem('tms_access_token');
        localStorage.removeItem('tms_user');
        if (!window.location.pathname.includes('/auth/login')) {
          notify.error('Session expired. Please log in again.');
          window.location.href = '/auth/login';
        }
      } else if (status === 403) {
        notify.error('Permission denied for this operation.');
      } else if (status === 400 || status === 422) {
        notify.warning(message);
      } else if (status >= 500) {
        notify.error('Server encountered an issue. Please try again.');
      }
    } else {
      notify.error('Network connection error.');
    }

    return Promise.reject(error);
  },
);

export default api;
