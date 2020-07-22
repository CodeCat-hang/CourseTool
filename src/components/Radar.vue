<template>
  <q-card square>
    <q-card-section>
      <q-splitter v-model="splitter" @input="resize">
        <!--设置输入框，关联splitter，绑定事件resize，触发条件为文本输入 -->
        <template v-slot:before>
          <div class="q-gutter-y-lg q-mr-lg q-mb-md">
            <q-input outlined square v-model="title" label="标题" @input="reload" />
            <q-input outlined square v-model="subtitle" label="班级" @input="reload" />
            <!--设置输入框，关联title与subtitle，获取它们的值并为文本输入绑定事件reload -->

            <q-select outlined square v-model="countOption" :options="countOptions" @input="onChangeCount">
            <!-- 将表单元素的值与countOption相关联,将countOptions的值赋值给options，为文本输入绑定事件onChangeCount -->
              <template v-slot:prepend>
                <span class="text-subtitle2">维数：</span>
              </template>
            </q-select>

            <div class="row no-wrap q-gutter-x-md">
              <q-input outlined square bottom-slots v-model="names" type="textarea" rows="12" cols="14" label="维度名 (每行一个)" @input="onChangeNames">
                <!-- 设置输入框，关联names，定义行与列的数量，为文本输入绑定事件onChangeNames -->
                <template v-slot:hint> 共 {{ namesCount }} 个 </template>  
              </q-input>
              <q-input outlined square bottom-slots v-model="scores" type="textarea" rows="12" cols="24" label="维度值 (0 至 1 间的小数，每行一个)" @input="onChangeScores">
                <!-- 设置输入框，关联scores，定义行与列的数量，为文本输入绑定事件onChangeScores -->
                <template v-slot:hint> 共 {{ scoresCount }} 个 </template>
              </q-input>
            </div>

            <!-- <q-toggle left-label keep-color v-model="isFillArea" size="lg" color="green" label="背景填充" @input="reload" /> -->
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
import echarts from 'echarts/lib/echarts' //导包语句
import 'echarts/lib/chart/radar'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/legend'

import BUS from '../util/bus'
import EVENT from '../util/event'
import notify from '../util/notify'

const MAX_COUNT = 12  //定义常量：最大维度数为12
const INIT_COUNT = 5  //定义常量：初始维度数为5

export default {
  data() {
    return {
      splitter: 25,
      chartId: 'chart',
      chart: null,

      title: '软件工程2020第一学期课程目标达成度',
      titleFontSize: 30,  //标题字体大小
      subtitle: '软件工程173、174班',
      subtitleFontSize: 24, //子标题字体大小

      countOptions: this.buildCountOptions(),  //调用buildCountOptions方法
      countOption: { label: `${INIT_COUNT}`, value: INIT_COUNT },
      names: this.buildNames(),  //调用buildNames方法
      scores: this.buildScores(),  //调用buildScores方法
      namesCount: INIT_COUNT,
      scoresCount: INIT_COUNT,

      isFillArea: true
    }
  },
  computed: {
    indicator: function() {
      let indicator = []
      this.names.split(/[\n]/).forEach(e => {  //split:把字符串分割成字符串数组；foreach：输出数组中的每个元素
        indicator.push({ name: e, min: 0, max: 1 })  //push：向数组的末尾添加元素
      })
      return indicator
    },
    passScores: function() {
      let scores = []
      for (let i = 0; i < this.countOption.value; i++) {
        scores.push(0.6)  //定义及格分数为0.6
      }
      return scores
    }
  },
  methods: {
    buildCountOptions() {  ////设置维度最小值及增加方法
      let options = []
      for (let i = 3; i <= MAX_COUNT; i++) {  
        options.push({ label: `${i}`, value: i })
      }
      return options
    },
    buildNames() {  //设置维度名
      const count = this.countOption ? this.countOption.value : INIT_COUNT
      let names = []
      for (let i = 0; i < count; i++) {
        names.push(`维度名 ${i + 1}`)
      }
      return names.join('\n')
    },
    buildScores() {  //设置维度值
      const count = this.countOption ? this.countOption.value : INIT_COUNT
      let scores = []
      for (let i = 0; i < count; i++) {
        scores.push('0.75')
      }
      return scores.join('\n')
    },
    onChangeCount() {  //修改维度计数
      this.names = this.buildNames()
      this.scores = this.buildScores()
      this.reload()
    },
    onChangeNames() {  //修改维度名
      this.namesCount = this.names.split(/[\n]/).length
      this.reload()
    },
    onChangeScores() {  //修改维度值
      this.scoresCount = this.scores.split(/[\n]/).length
      this.reload()
    },

    reload() {  //重载
      //this.chart.clear()
      this.chart.setOption(this.buildOption())
    },
    resize() {  //调整大小
      this.chart.resize()
    },
    buildOption() {  //设置选项
      const names = this.names.split(/[\n]/)
      if (names.length !== this.countOption.value) {
        notify.err(`当前有 ${names.length} 个维度名，期望 ${this.countOption.value} 个`)
        return {}
      }
      for (let i = 0; i < names.length; i++) {
        names[i] = names[i].trim()
        if (names[i].length < 2 || names[i].length > 20) {
          notify.err(`第 ${i + 1} 个维度名的长度必须介于 2 至 20`)
          return {}
        }
      }

      if (Array.from(new Set(names)).length < names.length) {
        notify.err(`出现了重复的维度名`)
        return {}
      }

      const scores = this.scores.split(/[\n]/)
      if (scores.length !== this.countOption.value) {
        notify.err(`当前有 ${scores.length} 个维度值，期望 ${this.countOption.value} 个`)
        return {}
      }
      for (let i = 0; i < scores.length; i++) {
        scores[i] = scores[i].trim()
        if (scores[i].length === 0) {
          notify.err(`第 ${i + 1} 个维度值为空`)
          return {}
        }
        if (isNaN(scores[i])) {
          notify.err(`第 ${i + 1} 个维度值【${scores[i]}】不是合法的数值`)
          return {}
        }
        const v = parseFloat(scores[i])
        if (v < 0 || v > 1) {
          notify.err(`第 ${i + 1} 个维度值【${scores[i]}】超出了区间 [0, 1]`)
          return {}
        }
      }

      return {
        toolbox: { show: true, feature: { saveAsImage: { name: `${this.title}-${this.subtitle}` } } },
        textStyle: { fontFamily: 'Times New Roman', fontSize: 24, fontWeight: 'bold' },
        title: {
          left: 'center',
          text: this.title,
          textStyle: { color: '#000', fontSize: this.titleFontSize },
          subtext: this.subtitle,
          subtextStyle: { color: '#999', fontSize: this.subtitleFontSize }
        },
        color: ['#21ba45', '#d16e6b'],
        legend: {
          top: 80,
          right: 100,
          itemGap: 40,
          selectedMode: false,
          data: ['及格', '实际']
        },
        radar: {
          center: ['50%', '55%'],
          name: { textStyle: { color: '#1976d2' } },
          indicator: this.indicator
        },
        series: [
          {
            type: 'radar',
            data: [{ name: '实际', value: this.scores.split(/[\n]/) }],
            label: { show: true, position: 'bottom', distance: 10, color: '#000', fontSize: 32 },
            lineStyle: { width: 4, color: '#21ba45' },
            areaStyle: { color: '#21ba45', opacity: this.isFillArea ? 0.3 : 0 }
          },
          {
            type: 'radar',
            data: [{ name: '及格', value: this.passScores }],
            lineStyle: { width: 2, color: '#d16e6b' },
            areaStyle: { color: '#d16e6b', opacity: this.isFillArea ? 0.3 : 0 }
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
