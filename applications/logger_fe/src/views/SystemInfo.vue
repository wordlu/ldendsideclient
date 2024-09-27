<template>
  <div class="info">
    <p class="tip">{{ t('common.systemInfoTip') }}</p>
    <el-link class="link" :href="`http://${link}`" type="primary" target="_blank">cockpit</el-link>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const link = ref<string>('') // cockpit跳转链接

const envParam = import.meta.env
link.value = envParam.PROD
  ? location.hostname + envParam.VITE_COCKPIT_URL
  : envParam.VITE_COCKPIT_URL
</script>

<style lang="scss" scoped>
.info {
  text-align: center;
  .tip {
    // color: $color-tip;
  }
  .link {
    font-size: 2rem;
    margin-top: 1rem;
  }
}
</style>
