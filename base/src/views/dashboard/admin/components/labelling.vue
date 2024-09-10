<template>
  <div>
    <el-table
      :data="tableData.slice((currentPage - 1) * page_size, currentPage * page_size)"
      :height="tableHeight"
      style="width: 100%"
      :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
      >
      <el-table-column
        prop="type"
        :label="$t('TableListName.type')"
        width="150">
      </el-table-column>
      <el-table-column
        prop="status"
        :label="$t('TableListName.status')"
        width="150">
      </el-table-column>
      <el-table-column
        prop="user_name"
        :label="$t('TableListName.userName')"
        width="150">
      </el-table-column>
      <el-table-column
        prop="create_datetime"
        :label="$t('TableListName.CreateDate')"
        width="180">
      </el-table-column>
      <el-table-column
        prop="deadline_datetime"
        :label="$t('TableListName.EndDate')"
        width="180">
      </el-table-column>
      <el-table-column
        prop="description"
        :label="$t('TableListName.Description')">
      </el-table-column>
      <!-- <el-table-column
        fixed="right"
        :label="$t('TableListName.Edit')"
        width="100">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">{{$t('TableListName.Info')}}</el-button>
          <el-button type="text" size="small">{{$t('TableListName.Edit')}}</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <!-- 分页 -->
    <el-pagination
    background
    layout="prev, pager, next"
    page-size: page_size
    current-page:currentPage
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :total="total">
    </el-pagination>
  </div>
</template>

<script>
import { LabellingTaskList } from '@/api/labelling'
export default {
  data(){
    return{
      tableData:[],
      page_size:50,
      total:0,
      tableHeight: window.innerHeight * 0.57,
      currentPage:1,
    }
  },
  mounted(){
    this.getCutinLoist()
  },
  methods:{
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
      LabellingTaskList().then(res=>{
        self.tableData = res.message
        self.total = res.message.length
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
