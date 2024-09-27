// import Mock from 'mockjs'

// Mock.mock('/hello', {})

// Mock.mock(/\/api\/s1\/v1\/tagging_data\//, (opts) => {
//   return Mock.mock({
//     status: 200,
//     'data|20': [
//       {
//         'tag_id|+1': 10,
//         name: '@cname',
//         trigger_time: '@date',
//         start_time: '@date',
//         end_time: '@date',
//       },
//     ],
//   })
// })

// Mock.mock(/\/api\/s1\/v1\/tagging_collection\/\d+\//, (opts) => {
//   return Mock.mock({
//     status: 200,
//     data: {
//       id: 1,
//       name: 'name',
//       description: 'string',
//       'tagging_tags|20': [
//         {
//           'id|+1': 100,
//           name: '@name',
//           type: 2,
//         },
//       ],
//       tag_order: [119, 110, 112, -1, -1, 102, -1, 103, 104, 105],
//     },
//   })
// })

// Mock.mock(/\/api\/s1\/v1\/tagging_tag\/\d+\//, (opts) => {
//   return Mock.mock({
//     status: 200,
//     data: {
//       id: 20,
//       name: '@cname',
//       en_name: 'en_name',
//       'tagging_group_id|+1': 20,
//       tagging_group_name: '@cname',
//       'type|1': [1, 2],
//       description: '描述',
//     },
//   })
// })

// Mock.mock(/\/api\/s1\/v1\/tagging_tag\//, (opts) => {
//   return Mock.mock({
//     status: 200,
//     data: {
//       count: 100,
//       'results|20': [
//         {
//           'id|+1': 100,
//           name: '@cname',
//           tagging_group_name: '@name',
//           create_time: '@date',
//           'type|1': [1, 2],
//         },
//       ],
//     },
//   })
// })

// Mock.mock(/\/api\/s1\/v1\/tagging_group\/\d+\//, (opts) => {
//   return Mock.mock({
//     status: 200,
//     data: { id: 20, name: '@cname', en_name: 'tags', create_time: '@date' },
//   })
// })
// Mock.mock(/\/api\/s1\/v1\/tagging_group\//, (opts) => {
//   console.log(opts)
//   const size = opts.url.match(/page_size=(\d+)/)[0]
//   return Mock.mock({
//     status: 200,
//     data: {
//       count: 100,
//       'results|10': [{ 'id|+1': 20, name: '@cname', en_name: 'tags', create_time: '@date' }],
//     },
//   })
// })
