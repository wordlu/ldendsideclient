<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    Average_speedChart:{
      type:Object
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
              trigger: 'axis',
              axisPointer: {
                  type: 'shadow'
              },
              formatter: "{a} <br/>{b}: {c} (km/h)"
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top:'3%',
              containLabel: true
          },
          xAxis: {
              type: 'value',
              boundaryGap: [0, 0.01]
          },
          yAxis: {
              type: 'category',
              data: this.Average_speedChart.TotalCity
          },
          series: [
              {
                  name: (this.$store.getters.language =='zh')?'平均速度':'avaerageVelocity',
                  type: 'bar',
                  data: this.Average_speedChart.data
              },
          ]
      })
    }
  }
}
</script>
