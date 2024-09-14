<template>
  <div >

    <!-- v-model="innerVisible" -->
    <el-dialog
      id="addTags"
      width="30%"
      title="新增标签"
      v-model="innerVisible"
      
      :before-close="handleClose"
      append-to-body>
      <div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="mini" label-width="100px" class="demo-ruleForm">
          <el-form-item label="标签名称" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item label="标签分类" prop="category">
            <el-select v-model="ruleForm.category" placeholder="请选择标签分类" @change="getIcons()">
              <el-option label="trip" value="trip"></el-option>
              <el-option label="项目" value="项目"></el-option>
              <el-option label="批次" value="批次"></el-option>
              <el-option label="自定义" value="自定义"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="tag标签样式" prop="pattern">
            <tags :icons="tripIcons" style="min-height: 34px;width:100%;padding-bottom:2px;margin-bottom:12px;border-bottom:1px solid #dad5d5"/>
          </el-form-item>
          <el-form-item label="备注" prop="notes">
            <el-input type="textarea" v-model="ruleForm.notes"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>


<!-- <script  setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)

const handleClose = (done) => {
  ElMessageBox.confirm('确认关闭弹窗?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}
</script> -->



<script>
import tags from '@/components/dialog/tags.vue'
import gostore from '@/services/governance-store'
import { addItem, findAll } from '../../api/jsonApi'

export default {
  components:{
    tags
  },
  props:{
    innerVisible:Boolean
  },
  data() {
    return {
      ruleForm: {
        name: '',
        category: '',
        notes: '',
        sub: 'custom',
        project:this.$route.params.id
      },
      rules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          // { min: 1, max: 12, message: "名称长度在1到12个字符", trigger: "change" }
        ],
        category: [
          { required: true, message: '请选择标签分类', trigger: 'change' }
        ],
        // pattern: [
        //   { required: true, message: '请选择标签样式' }
        // ],
        notes: [
          { required: true, message: '请填写备注', trigger: 'blur' }
        ]
      },
      tripIcons: []
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //  this.$api['addItem']('tags',this.ruleForm).then(res=>{
          //   this.$emit('setAddTagsInnerVisible')
          //   this.$message({
          //     message: `标签 ${this.ruleForm.name} 创建成功`,
          //     type: 'success'
          //   });
          //  })
          addItem('tags',this.ruleForm).then(res=>{
            this.$emit('setAddTagsInnerVisible')
            this.$message({
              message: `标签 ${this.ruleForm.name} 创建成功`,
              type: 'success'
            });
           })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$emit('setAddTagsInnerVisible')
        })
        .catch(_ => {});
    },
    getIcons(){
      // this.$api['findAll']('tags',{project:this.$route.params.id, category: this.ruleForm.category, name: this.ruleForm.category}).then(res=>{
      //   this.ruleForm.pattern = res.data[0].pattern
      //   this.ruleForm.color = res.data[0].color
      //   this.tripIcons = res.data
      // })
      findAll('tags',{project:this.$route.params.id, category: this.ruleForm.category, name: this.ruleForm.category}).then(res=>{
        gostore.reset()
        const data = gostore.sync(res)
        if (!data || data.length === 0) return false;
        this.ruleForm.pattern = data[0].pattern
        this.ruleForm.color = data[0].color
        this.tripIcons = data
      })
    },
  }
}
</script>

<style lang="scss">
#addTags{
  .el-form-item__content{
    .el-button--primary{
      background-color:#FF7900;
      border-color: #FF7900;
    }
  }
  .el-dialog{
    border-radius: 12px;
  }
}
</style>