<template>
  <div class="Dropdown" @mouseenter="mousemoveDropdown" @mouseleave="mouseleaveDropdown">
    <svg-icon icon-class="Dropdown" style="width: 24px;height: 24px;" />
    <svg-icon :icon-class="!isShow?'Arrow_drop_down':'Arrow_drop_move'" style="width: 12px;height: 12px;margin-left: 4px;" />
    <div class="list" v-if="isShow">
      <span class="list-item" v-for="(item,index) in dropdownList" :key="index" @click.stop="toPath(item)" @mouseenter="mousemoveDropdownItem(item)" @mouseleave="mouseleaveDropdownItem(item)">
        <div class="list-item-info">
          <div class="list-item-icon">
            <!-- <svg-icon :icon-class="item.iconClass" style="width: 20px;height: 20px;" /> -->
            <img :src="item.iconClass" alt="" style="width: 20px;height: 20px;">
          </div>
          {{ item.name }}
        </div>
        <svg-icon class="openlevel" icon-class="openlevel" style="width: 12px;height: 12px;" v-if="item.openlevel" />
        <div class="list-item-l2" v-if="item.openlevel && item.isShow">
          <div class="list-item-l2-list">
            <div class="list-item-l2-item" v-for="(l2_item,l2_index) in item.children" :key="l2_index" @click.stop="toPath(l2_item)">
              {{ l2_item.name }}
            </div>
          </div>
        </div>
      </span>
    </div>
  </div>
</template>
<script>
import jsCookie from 'js-cookie'
import $dmsApi from '@/jsonapi/dms'

export default {
  data(){
    return{
      dropdownList:[
        {
          name:"连接器",
          path:`/project/connectorList/`,
          idType:'projectId',
          iconClass:'/icon/default/连接器.svg',
          openlevel:false,
          isShow:false
        },
        {
          name:"数据集",
          path:`/project/dataSetList/`,
          idType:'projectId',
          iconClass:'/icon/default/数据集首页图标.svg',
          openlevel:false,
          isShow:false
        },
        {
          name:"算法",
          path:`/project/scriptList/`,
          idType:'projectId',
          iconClass:'/icon/default/算法首页小图标.svg',
          openlevel:false,
          isShow:false
        },
        {
          name:"流程",
          iconClass:'/icon/default/场景挖掘项目.svg',
          openlevel:true,
          isShow:false,
          children:[
            {
              name:"当前流程",
              path:`/project/projectFlow/`,
              idType:'flowId',
            },
            {
              name:"历史记录",
              path:`/project/projectFlowHistory/`,
              idType:'flowId',
            }
          ]
        },
        {
          name:"标签库",
          path:`/project/tagLibList/`,
          iconClass:'/icon/default/标签库图标.svg',
          idType:'projectId',
          openlevel:false,
          isShow:false
        },
        // {
        //   name:"算法感知评测",
        //   path:`/project/scriptPEList/`,
        //   iconClass:'/icon/default/算法首页小图标.svg',
        //   idType:'projectId',
        //   openlevel:false,
        //   isShow:false
        // },
        //
        // {
        //   name:"场景库",
        //   path:`/project/sceneLibList/`,
        //   iconClass:'/icon/default/场景库首页.svg',
        //   idType:'projectId',
        //   openlevel:false,
        //   isShow:false
        // }
      ],
      isShow:false,
      l2Hsow:false
    }
  },
  mounted() {
    $dmsApi.query('applications', { project: jsCookie.get('projectId') }).then(res => {
      const data = res.data[0] ? res.data[0]["attributes"] : {}
      if (data.name) {
        this.dropdownList.push({
          "name": data.name,
          "path": data.path,
          "iconClass": data.iconclass,
          "idType": data.idtype,
          "openlevel": data.openlevel,
          "isShow": data.isshow
        })
      }
    })
  },
  methods:{
    mousemoveDropdown(e){
      this.isShow = true
    },
    mouseleaveDropdown(){
      if(!this.l2Hsow){
        this.isShow = false
      }
    },
    mousemoveDropdownItem(item){
      if(item.openlevel){
        item.isShow = true
        this.l2Hsow = true
      }
    },
    mouseleaveDropdownItem(item){
      if(item.openlevel){
        item.isShow = false
        this.l2Hsow = false
      }
    },
    toPath(item){
      if(!item.openlevel){
        if(this.$route.fullPath !== item.path){
          if(item.idType){
            this.$router.push(`${item.path}${jsCookie.get(item.idType)}` )
          }else{
            this.$router.push(item.path)
          }

        }
      }
    }
  }
}
</script>

<style lang="scss">
.Dropdown{
  height: 32px;
  padding-right: 30px;
  .list{
    position: absolute;
    left: 0px;
    top: 32px;

    box-sizing: border-box;

    width: 180px;
    height: 176px;

    /* 01 Netural/N000 */

    background: #FFFFFF;
    /* 01 Netural/N040 */

    border: 0.5px solid #F3F4F7;
    /* Light/Depth-Z300 */

    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 8px 16px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    z-index: 9;
    padding: 8px;
    display: flex;
    flex-direction: column;
    .list-item{
      width: 164px;
      height: 40px;
      padding: 0 8px;
      position: relative;

      /* 01 Netural/N020 */

      background: #FFFFFF;
      border-radius: 4px;

      /* General/text-md/CN-Regular */

      font-family: 'PingFang SC';
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      /* identical to box height, or 157% */

      /* 01 Netural/N700 */
      color: #2D2F39;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .list-item-l2{
        position: absolute;
        right: -180px;
        top: -8px;
        width: 184px;
        padding-left: 14px;
        background: rgba($color: #ffffff, $alpha: .1);
        .list-item-l2-list{
          /* Rectangle 363 */
          box-sizing: border-box;
          width: 180px;
          /* 01 Netural/N000 */

          background: #FFFFFF;
          /* 01 Netural/N040 */

          border: 0.5px solid #F3F4F7;
          /* Light/Depth-Z300 */

          box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 8px 16px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          padding: 8px;
          .list-item-l2-item{
            padding: 8px;
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            /* identical to box height, or 157% */
            /* 01 Netural/N700 */

            color: #2D2F39;
          }

          .list-item-l2-item:hover{
            background: #F9F9FB;
          }
        }

      }

      .list-item-info{
        display: flex;
        .list-item-icon{
          width: 20px;
          height: 20px;
          /* 01 Netural/N080 */
          background: #E1E3EB;
          border-radius: 4px;
          margin-right: 8px;
        }
      }
    }

    .list-item:hover{
      background: #F9F9FB;
    }
  }
}
</style>
