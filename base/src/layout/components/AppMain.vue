<template>
  <section class="app-main">
    <section id="Appmicro"></section>
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    },
    communication() {
      return this.$store.operation.communication
    },
  },
  wacth:{
    communication:{
      handler:function(newVal,oldVal){
        console.log(newVal,'communication 变化')
      },
      deep:true
    }
  },
}
</script>

<style lang="scss" scoped>
#Appmicro{
  width: 100%;
  height: 100%;
  overflow: auto;
}
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  background-color:rgb(240, 242, 245);
  position: relative;
  overflow: hidden;
}

.fixed-header+.app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header+.app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
