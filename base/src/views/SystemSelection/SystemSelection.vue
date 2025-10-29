<template>
  <div id="SystemSelection">
    
  </div>
</template>

<script>
export default {
  created(){
    
  },
  methods:{
    
  }
}
</script>

<style lang="scss">
#SystemSelection{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    // background: rgba($color: rgb(2, 0, 15), $alpha: .8);
    .SystemSelection-background{
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -1080px;
        margin-top: -624px;
    }
    .el-card{
        width: 15%;
        height: 40%;
        z-index: 999;
        background: rgba($color: #ffffff, $alpha: .5);
        .el-card__body{
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
    }
    .el-card:hover{
        background: rgba($color: #eb5e24, $alpha: 0.6);
        .SystemHeader{
            font-size: 36px;
            color: #ffffff;
            font-weight: 100;
        }
    }
    .SystemHeader{
        width: 100%;
        font-size: 24px;
        text-align: center;
    }
    .backSystem{
        text-align: center;
        padding: 12px;
        cursor:pointer;
    }
    .international-icon:hover{
        // color: red;
        font-size: 40px!important;
    }
}
</style>
