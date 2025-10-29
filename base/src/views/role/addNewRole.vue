<template>
  <div id="addNewRole">
    <el-dialog
      title="新增用户组"
      :visible.sync="addRoleProps.dialogVisible"
      width="30%"
      :before-close="handleClose">
      <span>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="用户组名称" prop="name">
            <el-input v-model.trim="ruleForm.name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="addRoleProps.dialogVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitForm('ruleForm')">创 建</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addRoleGroupe } from '@/api/user'
import Cookies from 'js-cookie'
export default {
  props:{
    addRoleProps:{
      type:Object
    }
  },
  data(){
    return{
      ruleForm: {
        name: '',
        creater_id:Cookies.get('creater_id')
      },
      rules: {
        name: [
          { required: true, message: '请输入用户组名称', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    handleClose(){
      this.addRoleProps.dialogVisible = false
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          addRoleGroupe(this.ruleForm).then(res=>{
            this.addRoleProps.dialogVisible = false
            this.$notify({
              title:  this.$store.getters.language === 'zh'?'成功':'successfully',
              message: `用户组 ${this.ruleForm.name} 创建成功！`,
              type: 'success'
            });
            this.$emit('updateNewList')
          }).catch(err=>{
            console.log(err)
            if(err.error_message.indexOf("for key 'name'") !== -1){
              this.$message({
                message: '用户组名称重复或与已删除用户组名称冲突，请重新规划名称',
                type: 'warning'
              });
            }
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
  }
}
</script>

<style>

</style>
