// 标签&标签组维护相关的http定义
import defHttp from '@/utils/http'
import {
  TagGroupModel,
  GetParams,
  TagGroupDetailModel,
  TagGroupType,
  DeleteModel,
  TagModel,
  TagDetailModel,
  TagType,
  AutoTagType,
  TaggingAutoTagModel,
} from '../model/tag'
// import '@/mock'

const modelUrl = '/api/s1/v1'

enum Api {
  TaggingGroup = '/tagging_group/', // 标签分组API
  TaggingTag = '/tagging_tag/', // 标签API
  TaggingAutoTag = '/tagging_auto_tag/', // 自动打标条件设置
}

/**
 * 获取标签分组列表
 * @param params { page: 当前页, page_size: 每页数据 }
 */
export const getTagGroupList = (params: GetParams) => {
  return defHttp.get<TagGroupModel>({ url: modelUrl + Api.TaggingGroup, params })
}

/**
 * 获取指定得标签分组详情
 * @param groupId 分组id
 */
export const getTagGroupDetail = (groupId: number) => {
  return defHttp.get<TagGroupDetailModel>({ url: modelUrl + Api.TaggingGroup + groupId + '/' })
}

/**
 * 新增或更新标签分组保存
 * @param data 新增或编辑的分组参数
 */
export const updateTagGroup = (data: TagGroupType) => {
  if (data.id) {
    return defHttp.put({ url: modelUrl + Api.TaggingGroup + data.id + '/', data })
  } else {
    return defHttp.post({ url: modelUrl + Api.TaggingGroup, data })
  }
}

/**
 *  删除指定的标签分组
 * @param id 指定分组的id
 */
export const deleteTagGroup = (id: number) => {
  return defHttp.delete<DeleteModel>({
    url: modelUrl + Api.TaggingGroup + id + '/',
  })
}

/**
 *  获取标签列表
 * @param params { page: 当前页, page_size: 每页数据 }
 */
export const getTagList = (params: GetParams) => {
  return defHttp.get<TagModel>({ url: modelUrl + Api.TaggingTag, params })
}

/**
 * 获取指定的标签详情
 * @param tagId 标签id
 */
export const getTagDetail = (tagId: number) => {
  return defHttp.get<TagDetailModel>({ url: modelUrl + Api.TaggingTag + tagId + '/' })
}

/**
 * 新增或更新标签保存
 * @param data 新增或编辑的标签参数
 */
export const updateTag = (data: TagType) => {
  if (data.id) {
    return defHttp.put({ url: modelUrl + Api.TaggingTag + data.id + '/', data })
  } else {
    return defHttp.post({ url: modelUrl + Api.TaggingTag, data })
  }
}

/**
 *  删除指定的标签
 * @param id 指定标签的id
 */
export const deleteTag = (id: number) => {
  return defHttp.delete<DeleteModel>({
    url: modelUrl + Api.TaggingTag + id + '/',
  })
}

/**
 * 获取自动打标的条件
 */
export const getTaggingAutoTag = () => {
  return defHttp.get<TaggingAutoTagModel>({ url: modelUrl + Api.TaggingAutoTag })
}

export const delTaggingAutoTag = (id: number) => {
  return defHttp.delete<DeleteModel>({
    url: modelUrl + Api.TaggingAutoTag + id + '/',
  })
}

/**
 * 更新或者添加自动打标的条件
 * @param data 自动打标的条件
 */
export const setTaggingAutoTag = (data: AutoTagType) => {
  if (data.id) {
    return defHttp.put({ url: modelUrl + Api.TaggingAutoTag + data.id + '/', data })
  } else {
    return defHttp.post({ url: modelUrl + Api.TaggingAutoTag, data })
  }
}
