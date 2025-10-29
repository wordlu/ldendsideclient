<template>
  <div>
    <el-table
      :data="tableData.slice((currentPage - 1) * page_size, currentPage * page_size)"
      :height="tableHeight"
      border
      :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
      style="width:100%">
      <!-- <el-table-column
        fixed
        label="State"
        width="70">
        <template slot-scope="scope">
          <svg-icon icon-class="no" style="font-size:28px" v-if="scope.row.is_finished == 0"/>
          <svg-icon icon-class="ok-in" style="font-size:28px" v-if="scope.row.is_finished == 1"/>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="task_id"
        :label="$t('TableListName.Task_id')"
        width="100">
      </el-table-column>
      <el-table-column
        prop="vehicle_model"
        :label="$t('TableListName.vehicle_desc')"
        width="120">
      </el-table-column>
      <el-table-column
        prop="driver_name"
        :label="$t('TableListName.driver_name_cn')"
        width="120">
      </el-table-column>
      <el-table-column
        prop="recorder_name"
        :label="$t('TableListName.recorder_name_cn')"
        width="120">
      </el-table-column>
      <el-table-column
        prop="start_datetime"
        :label="$t('TableListName.StartDate')"
        width="250">
      </el-table-column>
      <el-table-column
        prop="end_datetime"
        :label="$t('TableListName.EndDate')"
        width="250">
      </el-table-column>
      <el-table-column
        prop="plan_desc"
        :label="$t('TableListName.plan_desc')">
      </el-table-column>
      <el-table-column
        prop="task_desc"
        :label="$t('TableListName.Task_desc')">
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
    background
    layout="prev, pager, next"
    :page-size="page_size"
    current-page:currentPage
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { collection_task } from '@/api/tagging'
export default {
  data(){
    return{
      tableData:[],
      page_size:50,
      total:0,
      tableHeight:44.1 * 16,
      currentPage:1,
      formInline:{
        limit: 50,
        offset: 0
      },
    }
  },
  mounted(){
    this.getCutinLoist()
  },
  methods:{
    // 初始页currentPage、初始每页数据数page_size和数据data
    handleSizeChange: function (size) {
      this.formInline.limit = val
      this.tableHeight = 45 * (val+1)
      this.page_size = size;
      this.getCutinLoist()
    },
    handleCurrentChange: function(currentPage){
      this.formInline.offset = (val - 1) * this.formInline.limit
      this.currentPage = currentPage;
      this.getCutinLoist()
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
      collection_task(this.formInline).then(res=>{
        self.tableData = res.results
        self.total = res.total
      }).catch(err=>{
        console.log(err)
      })
    },
  }
}
</script>

<style lang="scss">
#taggingTask{
  padding: 10px;
  .cell{
    font-size: 13px;
  }
  .el-card__header{
    padding: 10px 20px;
  }
}
body .el-table th.gutter{
 display: table-cell!important;
}
</style>
