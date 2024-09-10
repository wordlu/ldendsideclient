<template>
  <div id="Layout3">
    
    <div id="main">
      <div style="width: 100%;">
        <section id="Appmicro"></section>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style lang="scss">
#Layout3{
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  position: relative;
  padding: 24px 0;

  #main{
    display: flex;
    width: 100%;
    // height: calc(100% - 130px);
    // height: calc(100% - 20px);
    overflow: hidden;
    #container{
      width: 100vw;
      #Appmicro,#__qiankun_microapp_wrapper_for_project__,#__qiankun_microapp_wrapper_for_scene_library__{
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
    #containerMenu{
      width: calc(100vw - 200px);
      #Appmicro,#__qiankun_microapp_wrapper_for_project__,#__qiankun_microapp_wrapper_for_scene_library__{
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
  }
}
</style>