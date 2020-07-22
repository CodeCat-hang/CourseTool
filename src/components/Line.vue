<template>
  <q-card square>
    <q-card-section>
      <q-splitter v-model="splitter" @input="resize">
        <template v-slot:before>
          <div class="q-gutter-y-lg q-mr-lg q-mb-md">
            <q-input outlined square v-model="title" label="标题" @input="reload" />
            <q-input outlined square v-model="subtitle" label="班级" @input="reload" />

            <div class="row no-wrap q-gutter-x-md">
              <div>
                <q-input outlined square bottom-slots v-model="scores" type="textarea" rows="20" cols="14" label="百分制，每行一个" @input="reload">
                  <template v-slot:hint> 共 {{ scoresCount }} 个 </template>
                </q-input>
              </div>

              <div style="width:390px">
                <div>
                  <q-list bordered separator>
                    <q-item clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon name="mdi-format-vertical-align-top" color="primary" />
                      </q-item-section>
                      <q-item-section>最高分</q-item-section>
                      <q-item-section side>{{ Math.max(...scoresArr) }}</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon name="mdi-format-vertical-align-center" color="orange" />
                      </q-item-section>
                      <q-item-section>平均分</q-item-section>
                      <q-item-section side>{{ avg }}</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon name="mdi-format-vertical-align-bottom" color="primary" />
                      </q-item-section>
                      <q-item-section>最低分</q-item-section>
                      <q-item-section side>{{ Math.min(...scoresArr) }}</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple>
                      <q-item-section avatar>
                        <q-icon name="mdi-alert-outline" color="red" />
                      </q-item-section>
                      <q-item-section class="text-red">不及格率</q-item-section>
                      <q-item-section side class="text-red">{{ (parseFloat(rates[0]) + parseFloat(rates[1])).toFixed(1) }} %</q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="q-mt-md">
                  <q-list bordered separator>
                    <q-item clickable v-ripple v-for="(e, i) in scopes" :key="i">
                      <q-item-section avatar>
                        <q-icon :name="`mdi-numeric-${i + 1}-box`" :color="i < 2 ? 'red' : 'primary'" />
                      </q-item-section>
                      <q-item-section :class="`text-${i < 2 ? 'red' : 'primary'}`">{{ e }}</q-item-section>
                      <q-item-section side>
                        <span :class="`text-${i < 2 ? 'red' : 'primary'}`">
                          <span>{{ counts[i] }}</span>
                          <span class="q-ml-xs"> ({{ rates[i] }} %) </span>
                        </span>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
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
import 'echarts/lib/chart/line'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'

import BUS from '../util/bus'
import EVENT from '../util/event'
import notify from '../util/notify'

export default {
  data() {
    return {
      splitter: 25,
      chartId: 'chart',
      chart: null,

      title: '《互联网软件开发》课程考核成绩统计',
      titleFontSize: 30,
      subtitle: '软件工程173、174班',
      subtitleFontSize: 26,
      axisFontSize: 28,

      scores:
        '36\n32\n78\n76\n77\n69\n69\n68\n66\n82\n74\n71\n75\n77\n78\n74\n68\n65\n68\n69\n69\n72\n66\n70\n83\n45\n68\n96\n33\n66\n76\n80\n82\n66\n65\n65\n75\n72\n81\n83\n86\n82\n82\n72\n44\n84\n65\n73\n95\n70\n83\n87\n90\n72\n84\n60\n73\n43\n75\n65\n86\n84\n89\n84\n84\n80\n89\n76\n85\n62\n64\n67\n44\n78\n84\n80\n84\n66\n47\n78\n67\n76\n77\n78\n79\n70\n84\n84\n68\n74\n77\n85\n77\n77\n77\n78\n70\n87\n76\n67\n68\n84\n75\n65\n68\n84\n73\n78\n89\n80\n76\n66\n84\n79\n77\n77\n76\n86\n74\n46\n36\n75\n68\n69\n79\n77\n86\n81',
      scoresArr: [],
      scoresCount: 0,
      scopes: ['0~49', '50~59', '60~69', '70~79', '80~89', '90~100'],
      counts: [],
      rates: [],
      avg: 0
    }
  },
  methods: {
    reload() {
      //this.chart.clear()
      this.chart.setOption(this.buildOption())
    },
    resize() {
      this.chart.resize()
    },
    buildOption() {
      let $scores = []
      let $total = 0
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
          notify.err(`【${arr[i]}】不是合法的百分制数`)
          return {}
        }
        const v = parseInt(arr[i])
        if (v < 0 || v > 100) {
          notify.err(`【${v}】超出了区间 [0, 100]`)
          return {}
        }
        $scores.push(v)
        $total += v
      }
      this.scoresArr = $scores
      this.scoresCount = $scores.length
      this.avg = ($total / $scores.length).toFixed(1)

      // 计算各分数段的学生个数
      const $counts = new Array(this.scopes.length).fill(0)
      $scores.forEach((s, i) => {
        if (s < 50) {
          $counts[0]++
        } else if (s < 60) {
          $counts[1]++
        } else if (s < 70) {
          $counts[2]++
        } else if (s < 80) {
          $counts[3]++
        } else if (s < 90) {
          $counts[4]++
        } else {
          $counts[5]++
        }
      })
      this.counts = $counts

      // 计算各分数段的人数百分比
      const $rates = new Array(this.scopes.length).fill(0)
      this.scopes.forEach((sc, i) => {
        $rates[i] = ((100.0 * $counts[i]) / $scores.length).toFixed(1)
      })

      // 保证百分比之和为1，用70~79分数段修正
      let sum = 0
      $rates.forEach((r, i) => {
        sum += i === 3 ? 0 : parseFloat($rates[i])
      })
      if (parseFloat($rates[3]) + sum !== 100) {
        $rates[3] = (100 - sum).toFixed(1)
      }
      this.rates = $rates

      return {
        toolbox: { show: true, feature: { saveAsImage: { name: `${this.title}-${this.subtitle}` } } },
        textStyle: { fontFamily: 'Times New Roman', fontSize: this.axisFontSize, fontWeight: 'bold' },
        grid: { top: 140 },
        title: {
          left: 'center',
          text: this.title,
          textStyle: { color: '#000', fontSize: this.titleFontSize },
          subtext: this.subtitle,
          subtextStyle: { color: '#999', fontSize: this.subtitleFontSize }
        },
        xAxis: {
          type: 'category',
          name: '成绩',
          data: this.scopes,
          axisLine: { lineStyle: { width: 3 } },
          axisTick: { lineStyle: { width: 3 }, alignWithLabel: true },
          axisLabel: { fontSize: this.axisFontSize },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          name: '人数',
          axisLine: { lineStyle: { width: 3 } },
          axisTick: { lineStyle: { width: 3 } },
          axisLabel: { fontSize: this.axisFontSize },
          splitLine: { lineStyle: { width: 2 } }
        },
        series: [
          {
            type: 'line',
            smooth: 0.4,
            symbolSize: 20,
            label: { show: true, color: '#000', fontSize: this.axisFontSize + 4 },
            lineStyle: { width: 6 },
            data: $counts
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
