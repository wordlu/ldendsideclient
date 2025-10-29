import store from '@/store'
import { getPipelinesConfigure } from '@/api/user'
import api from '@/jsonapi/api'

export function setApps(registerMicroApps){
  return new Promise(async resolve => {
    store.dispatch('operation/getConfigure').then(async res=>{  
      var apps = new Array();
      var webConfigureList = new Array();
      let webConfigure = res;
      //function
      await setRegisterMicroApps();
    
      //Since the project app configuration is generated
      async function setRegisterMicroApps(){
        let app = registerMicroApps;
        let d = webConfigure.system.department;
        for(let i=0;i<app.length;i++){
          for (let j = 0; j < d.length; j++){
            try {
              if (filterPermissio(app[i].name, d[j].Permissio)) {
                await appendnewApps(app[i], d[j].routerPrefix ,d[j].entry);
              } else {
                await appMatching(registerMicroApps, d[j].Permissio);
              }
            } catch (err) {
              throw new Error(err);
            }
          }
        }
        apps = webConfigureList;
        resolve(apps);
      }
    
      //Filter Permissions
      function filterPermissio(systemID,systemIDs){
        return systemIDs.filter(item => item == systemID).length > 0?true:false;
      }
    
      //App matching
      function appMatching(registerMicroApps, Permissio) {
        Permissio.forEach((item, index) => {
          const isExist = registerMicroApps.filter(i => i.name == item).length > 0 ? true : false;
          if (!isExist) {
            console.error(`The ${item} system does not exist`);
          }
        })
      }
    
      //Generate Configuration Item
      async function appendnewApps(app,routerPrefix,entry){
        let newApp = JSON.parse(JSON.stringify(app));
        if(typeof newApp.activeRule === 'string'){
          newApp.name = routerPrefix == ''?`${newApp.name}`:`${routerPrefix.substring(1)}_${newApp.name}`;
          newApp.entry = `${entry}${newApp.entry}`;
          newApp.activeRule = `${routerPrefix}${newApp.activeRule}`;
          newApp.props = {api};
          webConfigureList.push(newApp);
        } else {
          let arr = [];
          //Differentiate pipeline,Pipeline comes from customization of backend configuration
          if(newApp.type == 'pipeline'){
            await getPipelinesConfigure().then(res=>{
              res.results.forEach((item,index)=>{
                arr.push(`${routerPrefix}${newApp.defaultRule}/${item.pipeline_name}`);
              })
            })
          }else{
            newApp.activeRule.forEach((item,index)=>{
              arr.push(`${routerPrefix}${item}`);
            })
          }
          newApp.name = routerPrefix == ''?`${newApp.name}`:`${routerPrefix.substring(1)}_${newApp.name}`;
          newApp.entry = `${entry}${newApp.entry}`;
          newApp.activeRule = arr;
          newApp.props = {api};       
          webConfigureList.push(newApp);
        }
      }
    })
  })
}
