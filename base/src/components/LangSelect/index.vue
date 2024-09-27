<!--
 * @Author: your name
 * @Date: 2021-07-09 14:48:59
 * @LastEditTime: 2021-12-14 10:47:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \WEB_FrontEnd\data-management-system\src\components\LangSelect\index.vue
-->
<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div>
      <svg-icon class-name="international-icon" icon-class="language" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="language==='zh'" command="zh">
        中文
      </el-dropdown-item>
      <el-dropdown-item :disabled="language==='en'" command="en">
        English
      </el-dropdown-item>
      <!-- <el-dropdown-item :disabled="language==='es'" command="es">
        Español
      </el-dropdown-item> -->
      <el-dropdown-item :disabled="language==='jp'" command="jp">
        日本語
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import $ from 'jquery'
import actions from '@/micros/actions'
import Cookies from 'js-cookie'
export default {
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    handleSetLanguage(lang) {
      let message = ''
      if(lang == 'jp'){
        message = '言語の切り替えは成功しました'
      }else if(lang == 'en'){
        message = 'Switch Language Success'
      }else if(lang == 'zh'){
        message = '语言切换成功'
      }
      this.saveLanguageInfo(lang,message)
    },
    saveLanguageInfo(lang,message){
      this.$i18n.locale = lang
      this.$store.dispatch('app/setLanguage', lang)
      actions.setGlobalState({lang:lang});
      this.$message({
        message: message,
        type: 'success'
      })
    }
  }
}
</script>
