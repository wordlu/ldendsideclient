<!--
 * @Author: your name
 * @Date: 2021-07-09 14:49:01
 * @LastEditTime: 2021-08-12 10:48:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \WEB_FrontEnd\data-management-system\src\views\dashboard\admin\components\RaddarChart.vue
-->
<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 3000

export default {
  mixins: [resize],
  props: {
    TotalMileageChart:{
      type:Array
    },
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  computed:{
    lang() {
      return this.$store.getters.language
    },
  },
  watch:{
    lang(newVal){
      setTimeout(()=>{
        this.initChart()
      },100)
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} km <br/> '+((this.$store.getters.language =='zh')?'占比':'percentage')+' : {d} %'
        },
        series: [
            {
                name:(this.$store.getters.language =='zh')?'里程数':'distance',
                type: 'pie',
                radius: '55%',
                center: ['50%', '50%'],
                data: this.TotalMileageChart,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
      })
    }
  }
}
</script>
