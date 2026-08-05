function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 검색 색인용 HTML에 frontmatter keywords를 끼워 넣는다.
 * VitePress는 title / titles / text 만 색인하므로 keywords가 그냥 버려지고 있다.
 * 첫 h1 뒤에 넣는 이유는 VitePress가 heading 단위로 색인 문서를 쪼개기 때문이다.
 * 맨 앞에 넣으면 제목 없는 섹션이 생겨 검색 결과에 빈 항목이 뜬다.
 * @param {string} html
 * @param {string[] | undefined} keywords
 * @returns {string}
 */
export function injectKeywords(html, keywords) {
  if (!keywords || keywords.length === 0) return html
  const block = `<p class="search-keywords">${escapeHtml(keywords.join(' '))}</p>`
  if (/<\/h1>/.test(html)) {
    // 원본에 </h1> 뒤 개행이 있든 없든 block 뒤에는 정확히 하나의 개행만 남긴다.
    return html.replace(/<\/h1>\n?/, `</h1>\n${block}\n`)
  }
  return `${block}\n${html}`
}

/**
 * VitePress `search.options._render`에 그대로 넘긴다.
 * @param {string} src 마크다운 원문
 * @param {{ frontmatter?: Record<string, unknown> }} env
 * @param {{ render: (src: string, env: unknown) => string }} md
 * @returns {string}
 */
export function renderForSearch(src, env, md) {
  const html = md.render(src, env)
  // VitePress의 기본 렌더 경로(_render 미지정 시)는 frontmatter.search === false인 페이지를
  // 색인에서 빼는데, _render를 직접 넘기면 이 옵트아웃을 재구현하지 않는 한 사라진다.
  if (env?.frontmatter?.search === false) return ''
  return injectKeywords(html, env?.frontmatter?.keywords)
}
