// 当前作业标签相关API
import defHttp from '@/utils/http'
import {
  TagCollectionModel,
  UpdateTagPoolModel,
  TagDataModel,
  DeleteModel,
  AddTagType,
} from '../model/tag'
// import '@/mock'

const modelUrl = '/api/s1/v1'

enum Api {
  TaggingCollection = '/tagging_collection/', // 当前作业标签相关API
  TaggingData = '/tagging_data/', // 打标签相关API
}

/**
 * 获取指定作业标签集合
 * @param id 当前作业标签id
 */
export const getTagCollection = () => {
  return defHttp.get<TagCollectionModel>({ url: modelUrl + Api.TaggingCollection })
}

/**
 * 往标签池里添加或移除标签
 * @param id - 标签池id
 * @param data - 标签池的参数
 */
export const updateTagPool = (id: number, data: UpdateTagPoolModel) => {
  return defHttp.put({
    url: modelUrl + Api.TaggingCollection + id + '/',
    data,
  })
}

/**
 * 打标签方法
 */
export const addTags = (data: AddTagType) => {
  return defHttp.post({
    url: modelUrl + Api.TaggingData,
    data,
  })
}

/**
 * 获取已打标签数据
 * @param trip_id - 当前采集进程id,  params: { trip_id }
 */
export const getTagData = () => {
  return defHttp.get<TagDataModel>({ url: modelUrl + Api.TaggingData })
}

/**
 * 修改更新已打标签
 * @param data 标签的参数
 */
export const updateTagData = (id: number, data: AddTagType) => {
  return defHttp.put({ url: modelUrl + Api.TaggingData + id + '/', data })
}

/**
 * 删除指定的已打标签数据
 * @param id - 已打标签数据的id
 */
export const deleteTagData = (id: number) => {
  return defHttp.delete<DeleteModel>({ url: modelUrl + Api.TaggingData + id + '/' })
}
