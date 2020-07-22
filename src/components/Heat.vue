<template>
  <q-card square>
    <q-card-section>
      <q-splitter v-model="splitter" @input="resize">
        <template v-slot:before>
          <div class="q-gutter-y-lg q-mr-lg q-mb-md" >
            <q-input outlined square v-model="title" label="标题" @input="reload" />
            <q-input outlined square v-model="subtitle" label="班级" @input="reload" /> 
            <q-select outlined square v-model="countOption" :options="countOptions" @input="onChangeCount">
              <template v-slot:prepend>
                <span class="text-subtitle2">作业数量:</span>
              </template>
            </q-select>           
             <q-input outlined square v-model="editor" type="textarea" rows="21" cols="14" label="学生成绩:" @input="onChangeData"/>
                          
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
import echarts from 'echarts'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'

import BUS from '../util/bus'
import EVENT from '../util/event'
import notify from '../util/notify'

const HOMEWORK_COUNT = 5
const MAX_HOMEWORK=5
const Stu_COUNT = 20

export default {
  data() {
    return {
      splitter: 25,
      chartId: 'chart',
      chart: null,

      title: '《XXXXXX》课程学生作业得分热力图分布',
      titleFontSize: 30,
      subtitle: '软件工程1XY、1XZ班',
      subtitleFontSize: 26,
      axisFontSize: 28,
      
      countOptions: this.buildCountOptions(),
      countOption: { label: `${HOMEWORK_COUNT}`, value: HOMEWORK_COUNT },

      namesCount: Stu_COUNT,
      homeworkCount: HOMEWORK_COUNT,
      data: this.buildDatas(),
      columns:this.buildColums(),
      editor: null
    }
  },
  methods: {
    onChangeData(){
        let data_test = []
        let code = this.editor.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
        code.forEach((item, index) => { // 删除空项
        if (!item) {
              code.splice(index, 1);
            }
        })
        var dataAll = []
        code.forEach((item,index)=>{
          let data_test = item.split(/[\s]+/)//将按照换行划分得到的字符串数组再按照空格进行识别
          let stuname = data_test[0]
          let a=data_test[1]
          let b=data_test[2]
          let c=data_test[3]
          let d=data_test[4]
          let e=data_test[5]
          dataAll[index]={
              name: `${stuname}`,homework01: a,homework02: b,homework03: c,homework04: d,homework05:e
          }
        })
        this.data = dataAll
        this.reload()
        // console.log(dataAll)
   
    },
    buildCountOptions() {  //设置作业数量
      let options = []
      for (let i = 1; i <= MAX_HOMEWORK; i++) {  
        options.push({ label: `${i}`, value: i })
      }
      return options
    },
    reload() {
      this.chart.clear()
      this.chart.setOption(this.buildOption())
    },
    resize() {
      this.chart.resize()
    },
    buildDatas() {
      const count = this.namesCount ? this.namesCount : Stu_COUNT
      var names = []
      for (let i = 0; i < count; i++) {
        names.push(`学生${i + 1}`)
      }

      var data = []
      if(names){
        for(let i = 0;i < names.length;i++){
          var stuname = names[i]
          let a=Math.round(Math.random()*100)
          let b=Math.round(Math.random()*100)
          let c=Math.round(Math.random()*100)
          let d=Math.round(Math.random()*100)
          let e=Math.round(Math.random()*100)
          data[i]={
              name: `${stuname}`,homework01: a,homework02: b,homework03: c,homework04: d,homework05:e
          }
        }
      }

      return data
    },
    onChangeCount() {
      this.data =  this.buildDatas(),
      this.columns =  this.buildColums()
      this.reload()
    },
    buildColums(){
      var colums=[]
      const count = this.countOption ? this.countOption.value: HOMEWORK_COUNT
      for(let i = 0;i<=count;i++){
        if(i==0){
          colums[i]={
            name: 'desc', align: 'center', label: '姓名', field: 'name'
          }
        }else if(i==1){
          colums[i]={
            name: 'homework01', align: 'center', label: '作业一', field: 'homework01'
          }
        }else if(i==2){
          colums[i]={
             name: 'homework02', align: 'center',label: '作业二', field: 'homework02'
          }
        }else if(i==3){
          colums[i]={
            name: 'homework03', align: 'center',label: '作业三', field: 'homework03'
          }
        }else if(i==4){
         colums[i]={
            name: 'homework04', align: 'center',label: '作业四', field: 'homework04'
          }
        }
        else if(i==5){
          colums[i]={
            name: 'homework_05', align: 'center',label: '作业五', field: 'homework_05'
          }
        }
      }
      return colums
    },
    buildOption() {
      let xCount = this.data.length
      let xLabels = []
      for (let i = 0; i < xCount; i++) {
        let name  = this.data[i].name
        xLabels.push(name)
      }

      let yCount = this.columns.length-1
      let yLabels = []
      for (let i = 0; i < yCount; i++) {
        let homeworkname = this.columns[i+1].label
        yLabels.push(homeworkname)
      }

      let data = []

      for(var i = 0;i<this.data.length;i++){
        for(var j = 0;j<this.countOption.value;j++){
          switch(j){
            case 0:
              data.push([i,j,parseInt(this.data[i].homework01)])
              break
            case 1:
               data.push([i,j,parseInt(this.data[i].homework02)])
               break
            case 2:
              data.push([i,j,parseInt(this.data[i].homework03)])
              break
            case 3:
              data.push([i,j,parseInt(this.data[i].homework04)])
              break
            case 4:
              data.push([i,j,parseInt(this.data[i].homework05)])
              break
          }
        }
      }

      return {
        toolbox: { show: true, feature: { saveAsImage: { name: `${this.title}-${this.subtitle}` } } },
        textStyle: { fontFamily: 'Times New Roman', fontSize: this.axisFontSize, fontWeight: 'bold' },
        grid: {
          x:  50,
          x2: 10,
          y: 220,
          y2: 70
        },
        title: {
          left: 'center',
          text: this.title,
          textStyle: { color: '#000', fontSize: this.titleFontSize },
          subtext: this.subtitle,
          subtextStyle: { color: '#999', fontSize: this.subtitleFontSize }
        },
        tooltip: { trigger: 'item' },
        xAxis: {
          type: 'category',
          data: xLabels,
          splitLine: { show: true, interval: 0 },
          axisLabel: { interval: 0, rotate: 90 }
        },
        yAxis: {
          type: 'category',
          data: yLabels,
          splitLine: { show: true, interval: 0 },
          axisTick: { interval: 0 },
          axisLabel: { interval: 0 }
        },
        visualMap: {
          type: 'continuous',
          realtime: false,
          calculable: true,
          min: 0,
          max: 100,
          range: [0, 100],
          inRange: {
            // prettier-ignore
            color: [
              '#efda97', // 0+
              '#e9c392', // 10+
              '#e4af87', // 20+
              '#de987e', // 30+
              '#d88275',// 40+
              '#d3776c',// 50+
              '#cf6964',// 60+
              '#c95d5b',// 70+
              '#c95d5b',// 80+ 
              '#c0444c'// 90+ 
            ]
          },
          // calculable: false,
          orient: 'horizontal',
          left: 'center',
          top: 100,
          backgroundColor: '#eee'
        },
        series: [
          {
            type: 'heatmap',
            data: data,
            label: { show: false, color: '#000' },
            itemStyle: { 
              borderWidth: 1, 
              borderColor: '#ccc',
              emphasis: {
                shadowBlur: 150,
                borderColor:'#000000'
             } 
            }
          }
        ]
      }
    },
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
  components: {},
}

 </script> 