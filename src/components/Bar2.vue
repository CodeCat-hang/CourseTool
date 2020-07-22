<template>
  <q-card square>
    <q-card-section>
      <q-splitter v-model="splitter" @input="resize">
        <template v-slot:before>
          <div class="q-gutter-y-lg q-mr-lg q-mb-md">
            <q-input outlined square v-model="title" prefix="标题：" @input="reload" />

            <div class="row no-wrap q-gutter-x-md">
              <q-input outlined square v-model="legend1" prefix="图例 1：" @input="reload" />
              <q-input outlined square v-model="legend2" prefix="图例 2：" @input="reload" />
            </div>

            <div class="row no-wrap q-gutter-x-md">
              <q-input outlined square bottom-slots v-model="scores1" type="textarea" rows="30" cols="28" label="图例 1 数值 (0 至 1 间的小数，每行一个)" @input="reload">
                <template v-slot:hint> 共 {{ scoresCount1 }} 个 </template>
              </q-input>
              <q-input outlined square bottom-slots v-model="scores2" type="textarea" rows="30" cols="28" label="图例 2 数值 (0 至 1 间的小数，每行一个)" @input="reload">
                <template v-slot:hint> 共 {{ scoresCount2 }} 个 </template>
              </q-input>
            </div>
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
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/legend'

import BUS from '../util/bus'
import EVENT from '../util/event'
import notify from '../util/notify'

const MAX_COUNT = 12
const INIT_COUNT = 5

export default {
  data() {
    return {
      splitter: 26,
      chartId: 'chart',
      chart: null,

      title: '《互联网软件开发》课程目标达成度对比',
      titleFontSize: 30,
      axisFontSize: 28,

      legend1: '软件工程16级',
      legend2: '软件工程17级',
      scores1: '0.73\n0.76\n0.69',
      scoresCount1: 3,
      scores2: '0.80\n0.78\n0.76',
      scoresCount2: 3
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
    checkScores(scores) {
      let $scores = []
      let arr = scores.split(/[\n]/)
      if (!arr || arr.length === 0) {
        return null
      }
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].trim()
        if (arr[i].length === 0) {
          continue
        }
        if (isNaN(arr[i])) {
          notify.err(`【${arr[i]}】不是合法的数值`)
          return null
        }
        const v = parseFloat(arr[i])
        if (v < 0 || v > 1) {
          notify.err(`【${v}】超出了区间 [0, 1]`)
          return null
        }
        $scores.push(v)
      }
      return $scores
    },
    buildOption() {
      const scores1 = this.checkScores(this.scores1)
      const scores2 = this.checkScores(this.scores2)
      if (!scores1 || !scores2) {
        return {}
      }
      if (scores1.length !== scores2.length) {
        notify.err(`两个图例的数值个数必须相同`)
        return {}
      }
      let xAxis = []
      scores1.forEach((s, i) => {
        xAxis.push(`CO${i + 1}`)
      })
      return {
        toolbox: { show: true, feature: { saveAsImage: { name: `${this.title}` } } },
        textStyle: { fontFamily: 'Times New Roman', fontSize: this.axisFontSize, fontWeight: 'bold' },
        grid: { top: 140 },
        title: {
          left: 'center',
          text: this.title,
          textStyle: { color: '#000', fontSize: this.titleFontSize }
        },
        legend: { data: [this.legend1, this.legend2], right: 20, top: 60, itemGap: 50 },
        xAxis: {
          type: 'category',
          name: '课程目标',
          data: xAxis,
          axisLine: { lineStyle: { width: 3 } },
          axisTick: { lineStyle: { width: 3 } },
          axisLabel: { fontSize: this.axisFontSize }
        },
        yAxis: {
          type: 'value',
          name: '达成度',
          max: 1,
          axisLine: { lineStyle: { width: 3 } },
          axisTick: { lineStyle: { width: 3 } },
          axisLabel: { fontSize: this.axisFontSize },
          splitLine: { lineStyle: { width: 2 } }
        },
        series: [
          { type: 'bar', name: this.legend1, data: scores1, label: { show: true, position: 'top' }, barCategoryGap: '50%' },
          { type: 'bar', name: this.legend2, data: scores2, label: { show: true, position: 'top' } }
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
