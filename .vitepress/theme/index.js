import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import AdSlot from './AdSlot.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(AdSlot, { position: 'top' }),
      'doc-after': () => h(AdSlot, { position: 'bottom' })
    })
  },
  enhanceApp({ app }) {
    // 마크다운 본문에 midContentAd가 삽입하는 <AdSlot />을 위해 전역 등록한다.
    app.component('AdSlot', AdSlot)
  }
}
