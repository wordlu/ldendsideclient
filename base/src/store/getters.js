/*
 * @Author: your name
 * @Date: 2021-07-09 14:49:00
 * @LastEditTime: 2021-11-12 16:57:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\store\getters.js
 */
const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.operation.token,
  avatar: state => state.operation.avatar,
  name: state => state.operation.name,
  introduction: state => state.operation.introduction,
  roles: state => state.operation.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  menuList: state => state.operation.menuList,
  isNewTask: state => state.operation.isNewTask,
  counters: state => state.operation.counters,
  microApp: state => state.operation.microApp,
  webConfigure: state => state.operation.webConfigure,
  communication: state => state.operation.communication,
  // 显示隐藏设置相关
  communicationInfo: state => state.operation.communicationInfo,
  // 图标管理
  icons: state => state.icons.icons
}
export default getters

