/**
 * @attr { prefixs } 前缀信息
 * @attr { prefix } 前缀
 * @attr { alias } 别名 运用与vuex中jsonAPI的标识
 * @attr { api } 服务间共享api的名称
 * @attr { note } 注释
 */
const store = {
  prefixs:[
    {
      prefix:"/ld_dms_server/ld_dm",
      alias:'common',
      api:'api',
      note:"系统默认前缀"
    },{
      prefix:"/ld_man_hour/models",
      alias:'dailyReport',
      api:'dailyReport',
      note:"日报管理系统前缀"
    },{
      prefix:"/ca_dms/models",
      alias:'dms',
      api:'dmsApi',
      note:"长安项目前缀"
    },{
      prefix:"/label_ca_dms/models",
      alias:'labelCa',
      api:'labelCaApi',
      note:"长安标注平台前缀"
    },{
      prefix:"/label_dms/models",
      alias:'label',
      api:'labelApi',
      note:"标注平台前缀"
    },
    {
      prefix:"/ld_front/micro_frontend",
      alias:'system',
      api:'system',
      note:"前端数据库配置接口前缀"
    },
    {
      prefix:`http://${window.server.ssoPrefix}/api/ld_front/micro_frontend`,
      alias:'ssoSystem',
      api:'ssoSystemApi',
      note:"sso前端数据库配置接口前缀"
    },
    {
      prefix:`http://dms${window.server.domain}/api/shell-dataasset/models`,
      alias:'dataasset',
      api:'dataassetApi',
      note:"数据资产管理"
    },
  ]
}

export default store;