<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCN from 'element-plus/lib/locale/lang/zh-cn'
import en from 'element-plus/lib/locale/lang/en'
import { reactive } from 'vue'

const langData = reactive<{ locale: any }>({ locale: zhCN })

const lang = localStorage.getItem('lang') || 'zh-CN'
if (lang === 'en') {
  langData.locale = en
}
</script>

<template>
  <el-config-provider :locale="langData.locale">
    <router-view></router-view>
  </el-config-provider>
</template>
