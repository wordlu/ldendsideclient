<template>
  <div class="benji">
    Logger<span>{{ t('common.softName') }}</span> V{{ version }}
    <el-link href="/agreement" type="primary" target="_blank">《{{ t('common.agree') }}》</el-link>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import Config from '../../package.json'

const { t } = useI18n()

const version = ref<string>(Config.version || '1.0.0')
</script>

<style lang="scss" scoped>
.benji {
  text-align: center;
}
</style>
