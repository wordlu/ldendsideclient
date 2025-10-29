<template>
  <div class="dashboard-editor-container">

    <panel-group :TotalObj="TotalObj" @handleSetLineChartData="handleSetLineChartData"/>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart :TotalMileageChart="TotalMileageChart" v-if="TotalMileageChart.length !== 0"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :TimeChart="TimeChart" v-if="TimeChart.TotalCity.length !== 0"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart :Average_speedChart="Average_speedChart" v-if="Average_speedChart.TotalCity.length !== 0" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
import BoxCard from './components/BoxCard'
import scenariolist from './components/scenariolist'
import tagginglist from './components/tagginglist'
import labellinglist from './components/labelling'
import { aqu_statis } from '@/api/dashboard'
import { configuration_cutin_list } from '@/api/scenario'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList,
    BoxCard,
    scenariolist,
    tagginglist,
    labellinglist
  },
  computed:{
    lang() {
      return this.$store.getters.language
    },
  },
  watch:{
    lang(newVal){
      this.getDasboardList()
    }
  },
  data() {
    return {
      activeName: 'first',
      tableData:[],
      page_size:50,
      total:0,
      tableHeight: window.innerHeight * 0.75,
      currentPage:1,
      TotalObj:{
      },
      TotalMileageChart:[],
      TotalCity:[],
      TimeChart:{
        data:[],
        available_time:[],
        TotalCity:[]
      },
      Average_speedChart:{
        data:[],
        TotalCity:[]
      },
      lineChartData: lineChartData.newVisitis
    }
  },
  created(){
    // console.log(this.TotalObj)
  },
  mounted(){
    this.getDasboardList()
    // this.getCutinLoist()
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    handleClick(row) {
      // console.log(row);
    },
    // 初始页currentPage、初始每页数据数page_size和数据data
    handleSizeChange: function (size) {
      this.page_size = size;
    },
    handleCurrentChange: function(currentPage){
      this.currentPage = currentPage;
    },
    dateFormat(fmt, date) {
      let ret="";
      date = new Date(date);
      const opt = {
        'Y+': date.getFullYear().toString(),
        'm+': (date.getMonth() + 1).toString(),
        'd+': date.getDate().toString(),
        'H+': date.getHours().toString(),
        'M+': date.getMinutes().toString(),
        'S+': date.getSeconds().toString()
      }
      for (let k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
          fmt = fmt.replace(
            ret[1],
            ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
          )
        }
      }
      return fmt
    },
    getCutinLoist(){
      let self = this
      configuration_cutin_list().then(res=>{
        res.message.forEach((item,index)=>{
          item.scene_order_time = self.dateFormat('YYYY-mm-dd HH:MM:SS',item.scene_order_time)
          let data = JSON.parse(item.config_of_main)
          item.area = data[0].data
          if(item.config_of_main[1].data == '1'){
            item.Weather = 'With rain'
          }else{
            item.Weather = 'Without rain'
          }
          if(item.config_of_main[2].data == '1'){
            item.special_Case = 'With Road Construction'
          }else{
            item.special_Case = 'Without Road Construction'
          }
        })
        self.tableData = res.message
        self.total = res.message.length
      }).catch(err=>{
        console.log(err)
      })
    },
    getDasboardList(){
      let self = this;
      aqu_statis().then((res)=>{
        let distanceList = []
        let timesList = []
        let average_speedList = []
        self.TotalMileageChart = []
        self.TotalCity = []
        self.TimeChart.data = []
        self.Average_speedChart.data = []
        self.TimeChart.available_time = []


        self.TotalObj = res.total_info[0]
        self.TotalObj.TotalAverage_speed = res.total_info[0].total_average_speed

        res.results.forEach(item => {
          distanceList.push(item.distance)
          timesList.push(item.time)
          average_speedList.push(item.sum_km)
          if(this.lang === 'zh'){
            self.TotalMileageChart.push({value:item.sum_km,name:item.area_name_cn})
            self.TotalCity.push(item.area_name_cn)
          }else{
            self.TotalMileageChart.push({value:item.sum_km,name:item.area_name})
            self.TotalCity.push(item.area_name)
          }
          self.TimeChart.data.push(item.sum_hour)
          self.Average_speedChart.data.push(item.average_speed)
          self.TimeChart.available_time.push(item.sum_hour)
        });
        self.TimeChart.TotalCity = self.TotalCity
        self.Average_speedChart.TotalCity = self.TotalCity
      }).catch((err)=>{
        console.log(err)
      })
    }
  }
}
</script>

<style lang="scss">
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .cell{
    font-size: 12px;
  }

  .dashboard-task-list{
    .el-card__header{
      padding: 18px 20px 0 20px!important;
    }
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
