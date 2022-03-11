import { createApp } from 'vue'
import App from './App.vue'
import ECharts from 'vue-echarts'
import { use } from "echarts/core"

// import ECharts modules manually to reduce bundle size
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  PieChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  PieChart,
  GridComponent,
  TooltipComponent
])


//样式引入
import 'element-plus/dist/index.css';

const app = createApp(App)

// register globally (or you can do it locally)
app.component('v-chart', ECharts)

app.mount('#app')

