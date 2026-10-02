import { defineBoot } from '#q-app';
import axios, { AxiosInstance } from 'axios';
import api from '../api/client';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api, axios };
