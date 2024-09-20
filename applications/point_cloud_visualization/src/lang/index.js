import { createI18n } from "vue-i18n";
import axios from 'axios'
import Cookies from 'js-cookie'

const messages = {
  en: {数据解压中请耐心等待:'Please be patient while the data is being extracted'},
  zh: {数据解压中请耐心等待:'数据解压中请耐心等待'},
  jp: {数据解压中请耐心等待:'データが抽出されている間、しばらくお待ちください'}
};

export function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage
  return 'zh'
}

const i18n = createI18n({
  locale: getLanguage(), // 设置当前语言类型
  legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
  globalInjection: true, // 全局注册$t方法
  messages,
});

export default i18n;
