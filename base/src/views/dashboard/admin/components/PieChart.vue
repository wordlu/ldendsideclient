<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    TimeChart:{
      type: Object
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
            formatter: "{b} <br/>{a}: {c} (h)"
          },
          grid: {
            // left: '5%',
            // right: '5%',
            bottom: '3%',
            top:'15%',
            containLabel: true
          },
          calculable: true,
          xAxis: [
            {
              type: 'category',
              data: this.TimeChart.TotalCity,
              axisLabel:{
                // formatter:function(value){
                //   return value.split("").join("\n")
                // }
                interval:0,
                rotate:35
              }
            }
          ],
          yAxis: [
              {
                  type: 'value'
              }
          ],
          series: [
              {
                  name:  (this.$store.getters.language =='zh')?'时长':'duration',
                  type: 'bar',
                  data: this.TimeChart.data,
                  markPoint: {
                      data: [
                          {type:'max'},
                          {type:'min'}
                      ]
                  },
                  markLine: {
                      data: [
                          // {type: 'average', name: '平均值'}
                      ]
                  }
              }
          ]
      })
    }
  }
}
</script>
