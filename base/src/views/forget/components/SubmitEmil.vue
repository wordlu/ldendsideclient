<template>
  <div id="SubmitEmil">
    <div class="SubmitEmil-from">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
              <!-- 请输入您要找回密码的邮箱地址 -->
                <span>{{$t('home.forgetMesage')}}</span>
            </div>
            <div>
                <el-form :model="dynamicValidateForm" ref="dynamicValidateForm" label-width="100px" class="demo-dynamic">
                    <el-form-item
                        size="mini"
                        prop="email"
                        :label="$t('home.email')"
                        :rules="[
                          // 请输入邮箱地址
                        { required: true, message:  $t('home.enterEmail'), trigger: 'blur' },
                        // 请输入正确的邮箱地址
                        { type: 'email', message: $t('home.int'), trigger: ['blur', 'change'] }
                        ]"
                    >
                        <el-input v-model="dynamicValidateForm.email"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="mini" type="primary" @click="submitForm('dynamicValidateForm')">
                          <!-- 提交 -->
                          {{$t('home.submit')}}

                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
  </div>
</template>

<script>
import { SubmitEmil } from '@/api/user'
export default {
  data() {
    return {
      dynamicValidateForm: {
        email: '',
        url:window.location.href.substring(0,window.location.href.lastIndexOf('/'))+'/password'
      }
    };
  },
  created(){
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          SubmitEmil(this.dynamicValidateForm).then(res=>{
            this.$alert('succcess:邮箱提交成功，请查看邮箱状态', '邮箱提交', {
              confirmButtonText: '确定',
              callback: action => {
                // this.$message({
                // type: 'info',
                // message: `action: ${ action }`
                // });
              }
            });
          }).catch((err)=>{
            this.$message({
              message: err.error_message == 'email is not registered'?'请检查邮箱是否注册':'邮箱信息提交失败请检查是否接入网络',
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
#SubmitEmil{
    width: 100%;
    height: calc(100% - 70px);
    display: flex;
    justify-content: center;
    background: #E9E9E9;
    .SubmitEmil-from{
        width:50%;
        height: 100%;
        background: #ffffff;
        padding: 15px;
    }
}
</style>
