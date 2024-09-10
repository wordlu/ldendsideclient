<template>
  <div id="SubmitPassword">
    <div class="SubmitPassword-from">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>请输入最新密码</span>
            </div>
            <div>
                <el-form :model="dynamicValidateForm" ref="dynamicValidateForm" :rules="rules" label-width="100px" class="demo-dynamic">
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="dynamicValidateForm.password" size="mini" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirm">
                        <el-input type="password" v-model="dynamicValidateForm.confirm" size="mini" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="mini" type="primary" @click="submitForm('dynamicValidateForm')">提交</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
  </div>
</template>

<script>
import { SubmitEmil } from '@/api/user'
import md5 from 'js-md5';

export default {
  data() {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
        callback(new Error('请输入密码'));
        } else {
        if (this.dynamicValidateForm.password !== '') {
            this.$refs.dynamicValidateForm.validateField('confirm');
        }
        callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
        callback(new Error('请再次输入密码'));
        } else if (value !== this.dynamicValidateForm.password) {
        callback(new Error('两次输入密码不一致!'));
        } else {
        callback();
      }
    };
    return {
      dynamicValidateForm: {
        password: '',
        confirm: '',
      },
      rules: {
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        confirm: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    };
  },
  created(){
    
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let options = {
            password:this.dynamicValidateForm.password,
            confirm:this.dynamicValidateForm.confirm,
            token:this.$route.query.token
          }
          SubmitEmil(options).then(res=>{
            this.$alert('密码修改成功，请重新登录', '密码修改成功', {
              confirmButtonText: '确定',
              callback: action => {
                this.$router.push('/login')
              }
            });
          }).catch((err)=>{
            this.$message({
              message: '密码修改失败',
              type: 'warning'
            });
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  }
}
</script>

<style lang="scss">
#SubmitPassword{
    width: 100%;
    height: calc(100% - 70px);
    display: flex;
    justify-content: center;
    background: #E9E9E9;
    .SubmitPassword-from{
        width:50%;
        height: 100%;
        background: #ffffff;
        padding: 15px;
    }
}
</style>