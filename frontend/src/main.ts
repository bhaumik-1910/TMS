import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Dialog, Loading, Dark } from 'quasar';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css';
import '@quasar/extras/material-icons-round/material-icons-round.css';

// Import Quasar css
import 'quasar/src/css/index.sass';

// Import custom application scss
import './css/app.scss';

import App from './App.vue';
import router from './router';

// ECharts registration for vue-echarts
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
]);

const app = createApp(App);
app.component('v-chart', VChart);

app.use(createPinia());
app.use(router);

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading,
    Dark,
  },
  config: {
    dark: true,
    notify: {
      position: 'top-right',
      timeout: 3500,
    },
  },
});
Dark.set(true);

app.mount('#app');
