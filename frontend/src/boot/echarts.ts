import { defineBoot } from '#q-app';
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

export default defineBoot(({ app }) => {
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

  app.component('v-chart', VChart);
});
