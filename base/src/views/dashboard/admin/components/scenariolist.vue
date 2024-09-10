<template>
  <div id="sceneMining">
    <el-table
      :data="tableData.slice((currentPage - 1) * page_size, currentPage * page_size)"
      style="width: 100%"
      row-key="computing_task_id"
      border
      :span-method="arraySpanMethod"
      lazy
      :header-row-style="{height:'38px'}"
      ref="singleTable"
      :load="load"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column
        prop="computing_task_id"
        :label="$t('sceanrioBank.Task_id')"
        width="70">
      </el-table-column>
      <el-table-column
        prop="trip_id"
        label="TripId"
        width="70">
      </el-table-column>
      <el-table-column
        prop="task_status"
        :label="$t('sceanrioBank.status')"
        width="120">
      </el-table-column>
      <el-table-column
        :label="$t('sceanrioBank.filename')"
        sortable
        width="280">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <div v-if="props.row.node !== 1">
              {{ JSON.parse(props.row.desc_str).f }}<br/>
              {{ JSON.parse(props.row.desc_str).ego }}<br/>
              {{ JSON.parse(props.row.desc_str).obj }}
            </div>
            <div v-if="props.row.node == 1">
              <span>
                {{$t('sceanrioBank.file')}}(error/done/processing)：<span style="color:red">{{props.row.error_items}}</span>/<span style="color:green">{{props.row.done_items}}</span>/<span style="color:blue">{{props.row.processing_items}}</span>
              </span>
              <span style="margin-left:15px">
                {{$t('sceanrioBank.totalFiles')}}：<span style="">{{props.row.total_items}}</span>
              </span>
              <span style="margin-left:15px">
                {{$t('sceanrioBank.startTime')}}：<span style="">{{formatter(props.row.start_time,"yyyy-MM-dd hh:mm:ss")}}</span>
              </span>
              <span style="margin-left:15px" v-if="props.row.task_status == 'Finished'">
                {{$t('sceanrioBank.cost')}}：<span style="">{{difference(formatter(props.row.start_time,"yyyy-MM-dd hh:mm:ss"),formatter(props.row.end_time,"yyyy-MM-dd hh:mm:ss"))}}</span>
              </span>
              <el-link style="margin-left:15px" v-if="props.row.task_status !== 'Finished'" @click="implement_forced_stop(props.row.computing_task_id)" type="danger">{{$t('sceanrioBank.exit')}}</el-link>
            </div>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        :label="$t('sceanrioBank.framePreprocessing')">
        <template slot-scope="props" v-if="props.row.node !== 1">
          <div v-if="props.row.level_3[0]">
            <div>
              <span>{{$t('sceanrioBank.framePreprocessing')}}：</span>{{formatter(props.row.level_3[0].start_time,"yyyy-MM-dd hh:mm:ss")}}
            </div>
            <div v-if="props.row.level_3[0].start_time !== null">
              <span>{{$t('sceanrioBank.cost')}}：</span>{{difference(formatter(props.row.level_3[0].start_time,"yyyy-MM-dd hh:mm:ss"),formatter(props.row.level_3[0].end_time,"yyyy-MM-dd hh:mm:ss"))}}
            </div>
            <div @click="lookLogs(props.row.level_3[0].computing_task_id)" v-if="props.row.level_3[0].task_status == 'Finished'">
              <span>{{$t('sceanrioBank.completed')}}：</span><el-button type="text">{{$t('sceanrioBank.viewLog')}}</el-button>
            </div>
            <div @click="lookErrer(props.row.level_3[0].computing_task_id)" v-if="props.row.level_3[0].task_status == 'errer'">
              <el-button type="text" style="color:red">{{$t('sceanrioBank.Viewerrorlog')}}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        :label="$t('sceanrioBank.semanticRecognitionLv1')">
        <template slot-scope="props" v-if="props.row.node !== 1">
          <div v-if="props.row.level_3[1]">
            <div>
              <span>{{$t('sceanrioBank.framePreprocessing')}}：</span>{{formatter(props.row.level_3[1].start_time,"yyyy-MM-dd hh:mm:ss")}}
            </div>
            <div v-if="props.row.level_3[1].start_time !== null">
              <span>{{$t('sceanrioBank.cost')}}：</span>{{difference(formatter(props.row.level_3[1].start_time,"yyyy-MM-dd hh:mm:ss"),formatter(props.row.level_3[1].end_time,"yyyy-MM-dd hh:mm:ss"))}}
            </div>
            <div @click="lookLogs(props.row.level_3[1].computing_task_id)" v-if="props.row.level_3[1].task_status == 'Finished'">
              <span>{{$t('sceanrioBank.completed')}}：</span><el-button type="text">{{$t('sceanrioBank.viewLog')}}</el-button>
            </div>
            <div @click="lookErrer(props.row.level_3[1].computing_task_id)" v-if="props.row.level_3[1].task_status == 'errer'">
              <el-link type="danger">{{$t('sceanrioBank.Viewerrorlog')}}</el-link>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        :label="$t('sceanrioBank.semanticRecognitionLv2')">
        <template slot-scope="props" v-if="props.row.node !== 1">
          <div v-if="props.row.level_3[2]">
            <div>
              <span>{{$t('sceanrioBank.framePreprocessing')}}：</span>{{formatter(props.row.level_3[2].start_time,"yyyy-MM-dd hh:mm:ss")}}
            </div>
            <div>
              <span v-if="props.row.level_3[0].start_time !== null">{{$t('sceanrioBank.cost')}}：</span>{{difference(formatter(props.row.level_3[2].start_time,"yyyy-MM-dd hh:mm:ss"),formatter(props.row.level_3[2].end_time,"yyyy-MM-dd hh:mm:ss"))}}
            </div>
            <div @click="lookLogs(props.row.level_3[2].computing_task_id)" v-if="props.row.level_3[2].task_status == 'Finished'">
              <span>{{$t('sceanrioBank.completed')}}：</span><el-button type="text">{{$t('sceanrioBank.viewLog')}}</el-button>
            </div>
            <div @click="lookErrer(props.row.level_3[2].computing_task_id)" v-if="props.row.level_3[2].task_status == 'errer'">
              <el-button type="text" style="color:red">{{$t('sceanrioBank.Viewerrorlog')}}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        :label="$t('sceanrioBank.indexCalculation')">
        <template slot-scope="props" v-if="props.row.node !== 1">
          <div v-if="props.row.level_3[3]">
            <div>
              <span>{{$t('sceanrioBank.framePreprocessing')}}：</span>{{formatter(props.row.level_3[3].start_time,"yyyy-MM-dd hh:mm:ss")}}
            </div>
            <div>
              <span v-if="props.row.level_3[0].start_time !== null">{{$t('sceanrioBank.cost')}}：</span>{{difference(formatter(props.row.level_3[3].start_time,"yyyy-MM-dd hh:mm:ss"),formatter(props.row.level_3[3].end_time,"yyyy-MM-dd hh:mm:ss"))}}
            </div>
            <div @click="lookLogs(props.row.level_3[3].computing_task_id)" v-if="props.row.level_3[3].task_status == 'Finished'">
              <span>{{$t('sceanrioBank.completed')}}：</span><el-button type="text">{{$t('sceanrioBank.viewLog')}}</el-button>
            </div>
            <div @click="lookErrer(props.row.level_3[3].computing_task_id)" v-if="props.row.level_3[3].task_status == 'errer'">
              <el-button type="text" style="color:red">{{$t('sceanrioBank.Viewerrorlog')}}</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[50]"
      :page-size="page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { parent_task_param , smp_sub_task , forced_stop , task_log } from '@/api/scenario'
import moment from 'moment'
export default {
  data(){
    return{
      searchParams:{
        computing_task_id:'',
        start_time:'',
        end_time:'',
        task_status:'',
        file_val:'',
        date_val:'',
        user_name:'',
        statusVal:'',
      },
      propsCreatedComputingTask:{
        dialogVisible: false
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      options:[],
      value2: '',
      statusVal:'',
      tableData: [],
      page_size:50,
      total:0,
      currentPage:1
    }
  },
  watch:{
    //监听 查询兑现的变化 并改变task列表的数据
    searchParams:{
      deep:true,
      handler:function(val){
        this.$nextTick(()=>{
          let params={
            computing_task_id:val.computing_task_id,
            start_time:val.date_val[0],
            end_time:val.date_val[1],
            task_status:val.task_status
          }
          for(var key in params) {
            if(params[key] === '' || params[key] === undefined || params[key] === null || params[key] === 'null' || params[key] === 'undefined') {
              delete params[key]
            }
          }
          parent_task_param(params).then(res=>{
            if(res.message.length !== 0){
              res.message.forEach(item => {
                item.hasChildren = true
                item.children = []
                item.node = 1
              });
            }
            this.tableData = res.message
            this.total = res.count
            this.$set(this.tableData)
          }).catch(err=>{
            console.log(err)
          })
        })
      }
    }
  },
  mounted(){
    this.$nextTick(() => {
      this.$refs.singleTable.doLayout(); // 解决表格错位
    });
    this.getparent_task_param()
  },
  methods:{
    handleClick(row) {
			console.log(row);
		},
		handleSizeChange(val) {
			let self = this
			self.page_size = val
			// if(this.value != ''){
			// 	let params = {
			// 		params:self.value+'?page='+self.currentPage+'&size='+self.page_size
			// 	}
			// 	self.getparent_task_param(params)
			// }
		},
		handleCurrentChange(val) {
			let self = this
			this.currentPage = val
			// if(this.value != ''){
			// 	let params = {
			// 		params:self.value+'?page='+self.currentPage+'&size='+self.page_size
			// 	}
			// 	self.getparent_task_param(params)
			// }
		},
		selectList(el){
			let self = this
			// let params = {
			// 	params:el+'?page='+self.currentPage+'&size='+self.page_size
			// }
			// self.getparent_task_param(params)
		},
    getparent_task_param(){
      parent_task_param().then(res=>{
        res.message.forEach(item => {
          item.hasChildren = true
          item.children = []
          item.node = 1
        });
        this.total = res.count
        this.tableData = res.message
      }).catch(err=>{
        console.log(err)
      })
    },
    // handleSizeChange(val) {
    //   console.log(`每页 ${val} 条`);
    // },
    // handleCurrentChange(val) {
    //   console.log(`当前页: ${val}`);
    // },
    load(tree, treeNode, resolve) {
      smp_sub_task(tree.computing_task_id).then(res=>{
        resolve(res.message)
      }).catch(err=>{
        console.log(err)
      })
    },
    //查看日志
    lookLogs(e){
      task_log(e).then(res=>{
        this.$confirm(res.message[0].log_str, 'logs', {
          confirmButtonText: this.$t('sceanrioBank.confirm'),
          type: 'info'
        })
      }).catch(err=>{
        console.log(err)
      })

    },
    //查看错误日志
    lookErrer(e){
      task_log(e).then(res=>{
        this.$confirm(res.message[0].log_str, 'error logs', {
          confirmButtonText: this.$t('sceanrioBank.confirm'),
          type: 'warning'
        })
      }).catch(err=>{
        console.log(err)
      })
    },
    // 还原
    reductionTaskList(){
      this.searchParams={
        computing_task_id:'',
        start_time:'',
        end_time:'',
        task_status:'',
        file_val:'',
        date_val:'',
        user_name:'',
        statusVal:'',
      }
      parent_task_param().then(res=>{
        res.message.forEach(item => {
          item.hasChildren = true
          item.children = []
          item.node = 1
        });
        this.tableData = res.message
        this.total = res.count
        this.$set(this.tableData)
      }).catch(err=>{
        console.log(err)
      })
    },
    formatter(thistime, fmt) {
      let test = new Date()
      let $this = new Date(thistime)
      let o = {
        'M+': $this.getMonth() + 1,
        'd+': $this.getDate(),
        'h+': $this.getHours(),
        'm+': $this.getMinutes(),
        's+': $this.getSeconds(),
        'q+': Math.floor(($this.getMonth() + 3) / 3),
        'S': $this.getMilliseconds()
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ($this.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
      }
      return fmt
    },
    difference(beginTime, endTime){
        var dateBegin = new Date(beginTime);
        var dateEnd = new Date(endTime);
        var dateDiff = dateEnd.getTime() - dateBegin.getTime();//时间差的毫秒数
        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
        var leave1 = dateDiff % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数
        var hours = Math.floor(leave1 / (3600 * 1000));//计算出小时数
        if(hours < 10){
          hours = '0'+hours
        }
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000);   //计算小时数后剩余的毫秒数
        var minutes = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
        if(minutes < 10){
          minutes = '0'+minutes
        }
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000);     //计算分钟数后剩余的毫秒数
        var seconds = Math.round(leave3 / 1000);
        if(seconds < 10){
          seconds = '0'+seconds
        }
        let diff = hours +':'+ minutes +':'+ seconds
        return diff;
        // document.getElementById("show").innerHTML = "<h1>" + "相差" + dayDiff + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒" + "</h1>";
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 3) {
        if(row.hasChildren){
          return [1, 5];
        }
      }
    },
    implement_forced_stop(e){
      forced_stop(e).then(res=>{
        console.log(res)
      }).catch(err=>{
        console.log(err)
      })
    },
    openCreatedtask(){
      this.propsCreatedComputingTask.dialogVisible = true
    },
    getCreatedComputingTaskData(e){
      this.$nextTick(()=>{
        parent_task_param().then(res=>{
          res.message.forEach(item => {
            item.hasChildren = true
            item.children = []
            item.node = 1
          });
          this.tableData = res.message
          this.total = res.count
          this.$set(this.tableData)
        }).catch(err=>{
          console.log(err)
        })
      })
    }
  }
}
</script>
<style>
.cell{
  font-size: 13px;
}
.el-table th, .el-table td{
  padding: 9px 0;
}
.el-card__header{
  padding: 10px 20px;
}
.el-card__body{
  padding: 10px 20px;
}
body .el-table th.gutter{
  display: table-cell!important;
}
</style>
<style lang="scss">
#sceneMining{
  width: 100%;
	overflow: hidden;
	// padding: 10px;
	// background-color: rgb(240, 242, 245);
  .taskVal{
    .el-input__inner{
      width: 70px;
    }
  }
  .file_val{
    .el-input__inner{
      width: 250px;
    }
  }
  .el-tooltip{
    width:100%!important
  }
  .el-card__header{

  }
  .clearfix{
    // display: flex;
    // flex-wrap: wrap;
  }
  .date_val{
    display: flex;
    .date_val_title{
      width: 100px;
      font-size: 13px;
      color: #909399;
      background-color: #F5F7FA;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #DCDFE6;
      border-right: none;
      border-radius: 4px 0 0 4px;
    }
    .el-input__inner{
      border-radius: 0px 4px 4px 0px!important;
    }
  }
}
.margin{
  margin-right: 10px;
}
.cell{
  font-size: 13px;
  .el-table__indent{
    padding-left:0!important
  }
}
.el-table th, .el-table td{
  padding: 9px 0;
}
.el-card__header{
  padding: 10px 20px;
}
body .el-table th.gutter{
  display: table-cell!important;
}
// .el-icon-circle-close::before{
//   color:red!important;
//   background: red!important;
// }
</style>
