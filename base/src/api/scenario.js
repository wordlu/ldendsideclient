import request from '@/utils/request'

//场景提取 场景筛选
export function scenarioSelect() {
  return request({
    url: '/dashboard/tag_order',
    method: 'get',
  })
}

//场景提取 配置
export function scenarioConfig() {
  return request({
    url: '/dashboard/cut_in_config',
    method: 'get'
  })
}

// 场景数据
// 场景提取 cut-in 列表展示
export function getCutin_data_analysis() {
  return request({
    url: '/dashboard/cut_in_config',
    method: 'get'
  })
}

// 场景提取 cut-in 提交配置文件
export function postCutin_data_analysis(data) {
  return request({
    url: '/dashboard/cutin_data_analysis',
    method: 'post',
    data
  })
}

// 场景展示 cut-in 图表展示配置
export function cut_in_configuration(data){
  return request({
    url: '/dashboard/cut_in_configuration',
    method: 'post',
    data
  })
}

// 场景展示 cut-in 图表展示配置提交
export function configuration_cutin_update(data){
  return request({
    url: '/dashboard/configuration_cutin_update',
    method: 'post',
    data
  })
}

// 场景展示 cut-in 列表
export function configuration_cutin_list(){
  return request({
    url: '/dashboard/cutin_data_analysis',
    method: 'get'
  })
}

// 场景展示 show_data 数据
export function cut_in_data_show(data){
  return request({
    url: '/dashboard/cut_in_data_show',
    method: 'post',
    data
  })
}

export function cut_in_objects(data){
  return request({
    url: '/dashboard/cut_in_objects',
    method: 'post',
    data
  })
}

export function flag_cut_in(data){
  return request({
    url: '/dashboard/flag_cut_in',
    method: 'post',
    data
  })
}

// 采集任务
export function tagging_task(){
  return request({
    url: '/dashboard/collection_task/',
    method: 'get'
  })
}

// 获取地区
export function area_list(){
  return request({
    url: '/dashboard/area/',
    method: 'get'
  })
}

// 通过地区选task
export function area_task(data){
  return request({
    url: '/dashboard/area2task/'+data.area,
    method: 'GET'
  })
}

// 通过task 获取文件
export function task_file(data){
  return request({
    url: '/dashboard/task2data/'+data,
    method: 'GET'
  })
}

// scenario V2.0

// 通过group_id 查询展示相应场景信息
export function groupid_scene_info(data){
  return request({
    url:'/smp_scene/groupid_scene_info/' + data.params,
    method:'GET'
  })
}

// 获取场景集列表
export function scene_group_list(){
  return request({
    url:'/smp_scene/scene_group/'
  })
}

// 新建场景集
export function createScene_group(data){
  return request({
    url:'/smp_scene/scene_group/',
    method:'POST',
    data
  })
}

export function param_stat_list(data){
  return request({
    url:'/smp_def/param_stat_list',
    method:'POST',
    data
  })
}

export function search_sce(data){
  return request({
    url:'/smp_def/search_sce',
    method:'POST',
    data
  })
}

export function add_scene_info(data){
  return request({
    url:'/smp_scene/add_scene_info',
    method:'POST',
    data
  })
}

export function scene_group_list_group(data){
  return request({
    url:'/smp_scene/scene_group/'+data.data,
    method:'GET'
  })
}

//根据group_id 获取 review 列表
export function get_image(data){
  return request({
    url:'/smp_pub_raw/get_image/'+data.data+'?page='+data.page+'&size='+data.size,
    method:'GET'
  })
}

//KPI评测
export function kpi_ref_dut(data){
  return request({
    url:'/smp_pub_raw/kpi_ref_dut',
    method:'POST',
    data
  })
}

//获取KPI结果
export function kpi_result_data(kpi_csv_name){
  return request({
    url:'/smp_pub_raw/kpi_result/'+ kpi_csv_name,  //{kpi_csv_name}
    method:'GET'
  })
}

//parent task 根据条件检索，支持一个或多个查询条件:task_id,files name,date retrieval,users name,task status
export function parent_task_param(data){
  return request({
    url:'/smp_task/smp_parent_task',
    method:'POST',
    data
  })
}

// 根据第一级任务id返回第一级任务的子项
export function smp_sub_task(data){
  return request({
    url:'/smp_task/smp_sub_task/'+data,//parent_task_id
    method:'GET'
  })
}

//强制终止计算任务
export function forced_stop(data){
  return request({
    url:'/smp_pub_raw/forced_stop/'+data,//parent_task_id
    method:'GET'
  })
}

//获取所有的采集plan列表
export function collection_plan(){
  return request({
    url:'/dashboard/collection_plan/',
    method:'GET'
  })
}

//根据采集计划选择已经完成的采集任务
export function plan2task(data){
  return request({
    url:'/dashboard/plan2task/'+data,//plan_id
    method:'GET'
  })
}

//根据采集任务选择对应的处理后的tripID
export function task2data(data){
  return request({
    url:'/dashboard/task2data/'+data,//task_id
    method:'GET'
  })
}

//创建计算任务
export function computing_task(data){
  return request({
    url:'/smp_task/computing_task',
    method:"POST",
    data
  })
}

//查看log
export function task_log(data){
  return request({
    url:'/smp_task/task_log/'+data,
    method:"GET"
  })
}

//获取视频
export function get_video(data){
  return request({
    url:'/smp_pub_raw/get_video/'+data,//scene_id
    method:"GET"
  })
}

//dashbord
export function data_statistics(){
  return request({
    url:'/smp_sematics/data_statistics',
    method:"GET"
  })
}

//全部导入
export function magna_scene_info_in(data){
  return request({
    url:'/smp_scene/magna_scene_info_in',
    method:"POST",
    data
  })
}

//场景列表 第一层
export function magna_scene_info_type(){
  return request({
    url:'/smp_scene/magna_scene_info_type',
    method:"GET"
  })
}

//第二层
export function magna_scene_info(data){
  return request({
    url:'/smp_scene/magna_scene_info',
    method:"POST",
    data
  })
}

//场景详情信息
export function sceneid_scene_info(data){
  return request({
    url:'/smp_scene/sceneid_scene_info/'+data,
    method:"GET"
  })
}

//获取当前场景的原始数据
export function sceneid_scene_info_detail(data){
  return request({
    url:'/smp_scene/sceneid_scene_info_detail/'+data //scene id
  })
}

// 获取创建路径
//获取当前场景的原始数据
export function enum_route(data){
  return request({
    url:'/smp_def/enum_route/'+data //tbl_name
  })
}

//根据 create_route 查找对应的场景集
export function route_groups(data){
  return request({
    url:'/smp_scene/route_groups/'+data //{create_route}
  })
}

//返回指定场景集下的所有trip
export function group_trips(data){
  return request({
    url:'/smp_scene/group_trips/'+data //{scene_group_id}
  })
}

//场景分析 X轴参数名称
export function scepara(){
  return request({
    url:'/smp_def/scepara/'
  })
}

//场景分析 场景单一维度分析
export function scene_analysis(data){
  return request({
    url:'/smp_scene/scene_analysis',
    method:"POST",
    data
  })
}

//场景分析 Y轴计算方法下拉框
export function param_list_drop_down(){
  return request({
    url:'/smp_def/param_list_drop_down'
  })
}

//场景审核 列表获取 统计信息
export function review_scene_count_list(data){
  return request({
    url:'/smp_scene/review_scene_count_list',
    method:"POST",
    data
  })
}

//根据场景组ID 获取该场景组中的场景分类
export function review_scene_type_list(data){
  return request({
    url:'/smp_scene/review_scene_type_list',
    method:"POST",
    data
  })
}

//审核状态修改
export function review_scene(data){
  return request({
    url:'/smp_scene/review_scene',
    method:"POST",
    data
  })
}

//获取场景树列表
export function tree_scene_info(){
  return request({
    url:'/smp_def/tree_scene_info',
    method:"GET"
  })
}

//获取所有trip列表
export function mark_trip_list(){
  return request({
    url:'/smp_data/mark_trip_list',
    method:"GET"
  })
}

//根据trip 获取到对应的文件列表
export function trip_file_list(trip_id){
  return request({
    url:'/smp_data/trip_file_list/'+trip_id,
    method:"GET"
  })
}

//根据 trip 、场景组、场景类型 file_name 查询对应的场景信息
export function mark_scene_list(data){
  return request({
    url:'/smp_scene/mark_scene_list',
    method:"POST",
    data
  })
}

//人工打标新增
export function mark_scene_add(data){
  return request({
    url:'/smp_scene/mark_scene_add',
    method:"POST",
    data
  })
}

//判断触发点是否重复
export function mark_scene_obj(data){
  return request({
    url:'/smp_scene/mark_scene_obj',
    method:"POST",
    data
  })
}

//删除打标场景
export function mark_scen_delete(data){
  return request({
    url:'/smp_scene/mark_scen_delete',
    method:"POST",
    data
  })
}

//更新人工打标列表
export function mark_scene_update(data){
  return request({
    url:'/smp_scene/mark_scene_update',
    method:"POST",
    data
  })
}


//get OpenX file
export function get_OpenX(group_id){
  return request({
    url:'/smp_scene/openx/'+group_id,
    method:"GET"
  })
}
