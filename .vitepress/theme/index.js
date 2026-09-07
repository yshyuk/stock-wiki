import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import AdSlot from './AdSlot.vue'
import ChapterMeta from './ChapterMeta.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 메타 줄은 제목 위(doc-before)에 놓인다. 제목 바로 아래는 마크다운 본문이라
      // 테마 슬롯이 없다. 광고 슬롯보다 뒤에 두어 제목과 붙어 보이게 한다.
      'doc-before': () => [h(AdSlot, { position: 'top' }), h(ChapterMeta)],
      'doc-after': () => h(AdSlot, { position: 'bottom' })
    })
  },
  enhanceApp({ app }) {
    // 마크다운 본문에 midContentAd가 삽입하는 <AdSlot />을 위해 전역 등록한다.
    app.component('AdSlot', AdSlot)
  }
}
