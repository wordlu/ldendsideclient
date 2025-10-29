const projects_proxy={
  zhulu:"http://zhulu.dms.liangdao.ai.10.86.14.200.nip.io",
  daily:"http://daily-report.dms.liangdao.ai.10.86.14.200.nip.io",
  cexun:"http://cexun.dms.liangdao.ai.10.86.14.200.nip.io"
}

export { projects_proxy };

export function setProxy(){
  for(let key in projects_proxy){
    if(key == process.env.ENV ){
      return projects_proxy[key]
    }
  }
}