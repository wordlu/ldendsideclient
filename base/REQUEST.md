<p>
  <img width="160" src="./logo.png">
</p>

# API使用文档

基于 **[jsonapi-vuex](https://github.com/mrichar1/jsonapi-vuex)** 自主封装的: 微前端从vuex存储调用api访问jasonApi的模块

## 简介

本文档提供一套完善的CRUD的调用方式，使用方法简单、定义简洁、调用方式灵活、支持query数据缓存、且适用大部分业务场景，并且支持基座与各服务间的资源共享。大幅度减轻了前后端对接的成本及api调用压力。



##### 注意:使用前尽量简单了解jsonApi规范结构会对本模块更快的了解就及上手

## 基本使用方法

##### v0.01 初步定制版

**1.请求连接定义 (@/utils/JsonApi.js)**

```js
const JsonApiService = axios.create({
  headers: {
    'Content-Type':'application/vnd.api+json' //jsonAPi 特定请求头
  },
  baseURL:'/api/ld_dms_server', //请求地址url可在配置文件中添加代理(vue.config.js)
  withCredentials: false, // 跨域请求时允许携带cookie
  timeout: 30000, // 请求最大时长
  .... // 特殊需求自行定制
})

//代理
proxy: {
    '/api/ld_dms_server': {
        target: 'http://xx.xx.xx.xx:xx',
            changeOrigin: true,
            ws: true,
            pathRewrite:{
                '^/api/ld_dms_server':'/api/ld_dms_server'
        	}
    	}
	}
}
```

**2.列表查询 findAll(module,query):**

* findAll 支持所有的get查询操作，应用范围包括 分页查询，模糊查询....
* 参数分为 module & query
  * module(必填)：请求资源名称 例：trip、scenario....  **type(String)  **
  * query(非必填)：query的参数 例: limit、offset、id、name... **type(Object)**

示例:

```js
请求url:`/api/ld_dms_server/trip/?page[limit]=10&page[offset]=0` `GET`

调用方式:
$api.findAll('trip',{
    'page[limit]':10,
    'page[offset]':0
}).then(res=>{
    console.log(res,'获取列表')
})

返回:
{
    data:[ //请求返回数据
        {tripId:123 .....}，
        ...
    ],
   	links:{ //相关连接
        first:'xxxxxxx?page[limit]=10$page[offset]=0',
        last:'xxxxx',
        next:'xxxxx',
        prev:'xxxxx'
    },
    meta:{ //自定义参数
        pagination:{
            count:14,
            limit:10,
            offset:0
        }
    }
}
```

**3.详情查询 findItem(module,id,Related):**

* findItem 支持单个查询及关联查询，应用范围包括 详情查询、关联查询
* 参数分为 module & id & Related
  * module(必填)：请求资源名称 **type(String)**
  * id(必填): 唯一键查询，精准查询  **type(int)**
  * Related(非必填): 查询关联项 **type(String)**

示例:

```js
请求url:`/api/ld_dms_server/trip/123` `GET`

调用方式:
$api['findItem']('trip',123).then(res=>{
    console.log(res,'获取详情')
})
or 
$api.findItem('vehicle',123).then(res=>{
    console.log(res,'获取详情')
})

请求url:`/api/ld_dms_server/trip/123/file` `GET`
关联查询： trip下的id123关联的文件信息
$api['findItem']('trip',123,'file').then(res=>{
    console.log(res,'获取详情')
})

返回：
{
    data:{
        attributes:{ //详情属性
            tripId:123
            ....
        },
        id:123, // 请求id
        relationships:{ //关联信息
            file:[
                
            ]，
            ....
        },
        type:'trip' //请求模块
    }
}
```

**4.数据新增 addItem(module,params) && addRelated(module,rels)(暂不开放)**

* addItem 支持数据新增，应用范围：列表新增、任务创建
* 参数分为 module & params
  * module(必填)：请求资源名称 **type(String)**
  * params(必填)：新增数据的信息 **type(Object)**

##### 注: params Obj模型，可在vuex 中创建，防止同模型重复使用。模型规则请查看 xx.x 

示例：

```js
请求url:`/api/ld_dms_server/trip` `POST`
模型示例:
{
	trip_name:String,
    file_path:String,
    area:String,
    mileage:Number
    ....
}

调用方式:
$api.addItem('vehicle',paramsModule).then(res=>{
    console.log(res,'获取详情')
})
```

**5.数据更新 updateItem(module,params) && updateRelated(module,rels)(暂不开放)**

* addItem 支持数据更新，应用范围：列表更新、状态修改
* 参数分为 module & params
  * module(必填)：请求资源名称 **type(String)**
  * params(必填)：新增数据的信息 **type(Object)**

##### 注: params Obj模型，可在vuex 中创建，防止同模型重复使用。模型规则请查看 xx.x 

示例：

```js
请求url:`/api/ld_dms_server/trip` `PATCH`
模型示例:
{
	trip_name:String,
    file_path:String,
    area:String,
    mileage:Number
    ....
}

调用方式:
$api.updateItem('vehicle',paramsModule).then(res=>{
    console.log(res,'获取详情')
})
```

**6.数据删除 removeItems(module,params) && removeRelated(module,rels)(暂不开放)**

* removeItems支持数据更新，应用范围：列表更新、状态修改
* 参数分为 module & params
  * module(必填)：请求资源名称 **type(String)**
  * params(必填)：新增数据的信息 **type(Object)**

##### 注: params Obj模型，可在vuex 中创建，防止同模型重复使用。模型规则请查看 xx.x 

示例：

```js
请求url:`/api/ld_dms_server/trip` `DELETE`
模型示例:
{
	ids:[11,22,33]
}

调用方式:
$api.removeItems('vehicle',paramsModule).then(res=>{
    console.log(res,'获取详情')
})
```

**7.报错处理 error**

* 报错处理由系统统一封装报错，前端不需要管理报错
* 一下提供报错格式，可以了解

示例:

```js
{
    "errors": [
        {
            "detail": "\"Lidarpppppp\" is not a valid choice.",
            "status": "400",
            "source": {
                "pointer": "/data/attributes/algorithm"
            },
            "code": "invalid_choice"
        },
        {
            "detail": "scene tree_id with value 0 does not exist",
            "status": "400",
            "source": {
                "pointer": "/data/attributes/scene_tree_ids"
            },
            "code": "invalid"
        }
    ]
}
```

