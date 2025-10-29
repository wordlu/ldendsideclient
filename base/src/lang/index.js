import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import Cookies from 'js-cookie'

axios.defaults.withCredentials = false;
// import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
// import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
// import elementEsLocale from 'element-ui/lib/locale/lang/es'// element-ui lang
// import elementJaLocale from 'element-ui/lib/locale/lang/ja'// element-ui lang
// import enLocale from './en'
// import zhLocale from './zh'
// import esLocale from './es'
// import jaLocale from './ja'

Vue.use(VueI18n)

const messages = {
  en: {},
  zh: {},
  jp: {}
}
export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage
  return 'zh'
}
const i18n = new VueI18n({
  locale: getLanguage(),
  // locale: 'en', 
  messages,
  // silentTranslationWarn: true,
})

// mergeLocale('Menu')
// mergeLocale('common')

// function mergeLocale(project){
//   for(let key in messages){
//     axios.get(`/langs/${project}/${key}.json`).then(res=>{
//       i18n.mergeLocaleMessage(key, res.data)
//     }).catch((err)=>{
//       console.log(err,'err')
//     })
//   }
// }

export default i18n
