import { Result } from './index'

export interface TagGroupType {
  id?: number
  name: string
  en_name: string
  description?: string
  detail?: string
  type?: number
  create_time: string
}

interface TagGroup {
  count: number
  results: TagGroupType[]
}

export interface TagType {
  id?: number
  name?: string
  en_name?: string
  type?: number
  description?: string
  detail?: string
  tagging_group_id?: number | null
  tagging_group_name?: string
  tagging_collections?: number[]
  create_time?: string
  trigger_time?: string
  trip_id?: number
  sessionid?: number
  img_url?: string
}
interface TagDataType {
  count: number
  results: TagType[]
}

export interface GetParams {
  page: number
  page_size: number
  type?: number
  name?: string
  tagging_group_name?: string
}

export interface TagCollectItem {
  id: number
  name?: string
  type?: number
  cached?: boolean
  img_url?: string
  is_auto?: boolean
}
export interface TagCollection {
  id: number
  name: string
  sessionid: string
  description?: string
  tagging_tags: Array<TagCollectItem>
  tag_order: number[]
}

export interface UpdateTagPoolModel {
  id: number
  name: string
  sessionid: string
  description?: string
  tagging_tags: number[]
  tag_order: number[]
}

export interface TagData {
  id?: number
  tag_id?: number
  name?: string
  trigger_time?: string
  start_time?: string
  end_time?: string
  type?: number
}

export interface TagDataRes {
  tagging_data: TagData[]
  tagging_cache: number[]
}

export interface AddTagType {
  id?: number
  type: number
  tag_id?: number
  name?: string
  trip_id?: number
  sessionid?: number
}

export interface RuleType {
  key: string
  operator: string
  int: any
  expr?: string
  label?: string
  desc?: string
}
export interface RulesType {
  tag_id: number
  duration?: number
  exprs: string
  expr_items: RuleType[]
}

export interface AutoTagType {
  id?: number
  name: string
  tag_id: number
  type: number
  rule?: RulesType
  enable?: boolean
  desc?: string
}

export type TagGroupModel = Result<TagGroup>

export type TagGroupDetailModel = Result<TagGroupType>

export type DeleteModel = Result<string>

export type TagModel = Result<TagDataType>

export type TagDetailModel = Result<TagType>

export type TagCollectionModel = Result<TagCollection>

export type TagDataModel = Result<TagDataRes>

export type TaggingAutoTagModel = Result<AutoTagType[]>
