import { h } from 'vue'
import mermaid from 'mermaid'
import DefaultTheme from 'vitepress/theme'
import AdSlot from './AdSlot.vue'
import ChapterMeta from './ChapterMeta.vue'
import DocSiteLinks from './DocSiteLinks.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 메타 줄은 제목 위(doc-before)에 놓인다. 제목 바로 아래는 마크다운 본문이라
      // 테마 슬롯이 없다. 광고 슬롯보다 뒤에 두어 제목과 붙어 보이게 한다.
      'doc-before': () => [h(AdSlot, { position: 'top' }), h(ChapterMeta)],
      // VitePress는 사이드바가 있는 페이지에서 전역 footer를 숨긴다. 글에서 소개·정책
      // 페이지로 바로 갈 수 있도록 본문 끝에 같은 링크를 다시 놓는다.
      'doc-after': () => [h(AdSlot, { position: 'bottom' }), h(DocSiteLinks)]
    })
  },
  enhanceApp({ app }) {
    // mermaid는 기본적으로 window load 때 .mermaid 요소를 직접 그린다. 플러그인의
    // initialize({ startOnLoad: false })보다 load가 먼저 오면 아직 비어 있는 자리를
    // 그리다 「Syntax error in text」를 남기므로, 앱 시작 시점에 자동 실행을 끈다.
    mermaid.startOnLoad = false

    // 마크다운 본문에 midContentAd가 삽입하는 <AdSlot />을 위해 전역 등록한다.
    app.component('AdSlot', AdSlot)
  }
}
