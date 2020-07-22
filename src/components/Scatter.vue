<template>
  <q-card square>
    <q-card-section>
      <q-splitter v-model="splitter" @input="resize">
        <template v-slot:before>
          <div class="q-gutter-y-lg q-mr-lg q-mb-md">
            <q-input outlined square v-model="title" label="标题" @input="reload" />
            <q-input outlined square v-model="subtitle" label="班级" @input="reload" />
            <q-input outlined square bottom-slots v-model="scores" type="textarea" rows="20" label="0 至 1 间的小数，每行一个" @input="reload">
              <template v-slot:hint> 共 {{ scoresCount }} 个 </template>
            </q-input>
          </div>
        </template>

        <template v-slot:after>
          <div :id="chartId" style="width:100%;height:80vh;" />
        </template>
      </q-splitter>
    </q-card-section>
  </q-card>
</template>

<script>
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/markLine'

import BUS from '../util/bus'
import EVENT from '../util/event'
import notify from '../util/notify'

export default {
  data() {
    return {
      splitter: 25,
      chartId: 'chart',
      chart: null,

      title: '《互联网软件开发》课程 COX 达成度分布',
      titleFontSize: 30,
      subtitle: '软件工程173、174班',
      subtitleFontSize: 26,
      axisFontSize: 28,

      scores:
        '0.63\n0.75\n0.89\n0.86\n0.81\n0.77\n0.68\n0.61\n0.62\n0.83\n0.83\n0.83\n0.81\n0.82\n0.89\n0.82\n0.85\n0.89\n0.85\n0.91\n0.79\n0.83\n0.87\n0.84\n0.77\n0.82\n0.80\n0.84\n0.81\n0.79\n0.87\n0.81\n0.84\n0.87\n0.82\n0.89\n0.87\n0.80\n0.70\n0.60\n0.63\n0.65\n0.76\n0.91\n0.79\n0.84\n0.81\n0.81\n0.81\n0.83\n0.87\n0.83\n0.88\n0.83\n0.76\n0.87\n0.75\n0.82\n0.85\n0.37\n0.51\n0.78\n0.85\n0.73\n0.68\n0.92\n0.73\n0.82\n0.81\n0.89\n0.77\n0.78\n0.76\n0.86\n0.71\n0.79\n0.71\n0.73\n0.83\n0.79\n0.81\n0.80\n0.83\n0.83\n0.69\n0.84\n0.81',
      scoresCount: 0
    }
  },
  methods: {
    reload() {
      this.chart.clear()
      this.chart.setOption(this.buildOption())
    },
    resize() {
      this.chart.resize()
    },
    buildOption() {
      let $scores = []
      let arr = this.scores.split(/[\n]/)
      if (!arr || arr.length === 0) {
        return {}
      }
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].trim()
        if (arr[i].length === 0) {
          continue
        }
        if (isNaN(arr[i])) {
          notify.err(`【${arr[i]}】不是合法的数值`)
          return {}
        }
        const v = parseFloat(arr[i])
        if (v < 0 || v > 1) {
          notify.err(`【${v}】超出了区间 [0, 1]`)
          return {}
        }
        $scores.push([i + 1, v])
      }
      this.scoresCount = $scores.length

      return {
        toolbox: { show: true, feature: { saveAsImage: { name: `${this.title}-${this.subtitle}` } } },
        textStyle: { fontFamily: 'Times New Roman', fontSize: this.axisFontSize, fontWeight: 'bold' },
        grid: { top: 140, right: 200 },
        title: {
          left: 'center',
          text: this.title,
          textStyle: { color: '#000', fontSize: this.titleFontSize },
          subtext: this.subtitle,
          subtextStyle: { color: '#999', fontSize: this.subtitleFontSize }
        },
        xAxis: {
          name: '序号',
          max: $scores.length,
          axisLine: { lineStyle: { width: 3 } },
          axisTick: { lineStyle: { width: 3 } },
          axisLabel: { fontSize: this.axisFontSize },
          splitLine: { show: false }
        },
        yAxis: {
          name: '达成度',
          axisLine: { lineStyle: { width: 3 } },
          axisTick: { lineStyle: { width: 3 } },
          axisLabel: { fontSize: this.axisFontSize },
          splitLine: { lineStyle: { width: 2 } }
        },
        series: [
          {
            type: 'scatter',
            symbolSize: 16,
            data: $scores,
            markLine: {
              symbol: 'none',
              lineStyle: { type: 'dotted', color: '#1976d2', width: 5 },
              data: [{ type: 'average' }],
              label: { formatter: '均值：{c}' }
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.chartId))
    this.reload()
    BUS.$on(EVENT.RESIZE, () => {
      this.chart.resize()
    })
  },
  beforeDestroy() {
    this.chart.dispose()
    BUS.$off(EVENT.RESIZE)
  },
  components: {}
}
</script>
