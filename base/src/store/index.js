import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

// import jsonApiConfig
import { jsonapiModule } from 'jsonapi-vuex'
import jsonApiConfig from '@/jsonapi/lib/main'

Vue.use(Vuex);

const apis = jsonApiConfig()
const modulesFiles = require.context('./modules', true, /\.js$/);

let modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
  const value = modulesFiles(modulePath);
  modules[moduleName] = value.default;
  return modules;
}, {});

//set api config in JsonApiService modules
const config = {
  preserveJson: true // Keep top-level structure
}

for(let i=0;i<apis.requests.length;i++){
  modules[apis.requests[i].alias] = jsonapiModule(apis.requests[i].request,config) 
}

const store = new Vuex.Store({
  modules,
  getters
})

export default store;
