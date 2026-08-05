/**
 * 본문 중간에 광고 슬롯을 넣는 markdown-it 플러그인.
 * 챕터가 70~130줄로 짧아서 상단·중간·하단 3개를 다 넣으면 본문 대비 광고가 과하다.
 * 섹션이 충분히 많은 문서에만 중간 광고를 넣는다.
 *
 * 챕터 페이지에만 적용한다 — `frontmatter.part`가 챕터 여부를 가리는 기존 신호다
 * (seo.js의 isChapter와 동일 기준). 정책 페이지(about/privacy, about/disclaimer 등)는
 * `##` 섹션이 여러 개여도 챕터 집필 의도로 만든 조건이 아니므로 광고가 붙지 않아야 한다.
 *
 * @param {import('markdown-it')} md
 * @param {{ minSections?: number, beforeSection?: number }} opts
 */
export function midContentAd(md, { minSections = 4, beforeSection = 3 } = {}) {
  md.core.ruler.push('mid_content_ad', (state) => {
    if (typeof state.env?.frontmatter?.part !== 'number') return

    const h2Indexes = []
    state.tokens.forEach((token, i) => {
      if (token.type === 'heading_open' && token.tag === 'h2') h2Indexes.push(i)
    })

    if (h2Indexes.length < minSections) return

    const target = h2Indexes[beforeSection - 1]
    if (target === undefined) return

    const adToken = new state.Token('html_block', '', 0)
    adToken.content = '<AdSlot position="mid" />\n'
    adToken.block = true
    state.tokens.splice(target, 0, adToken)
  })
}
