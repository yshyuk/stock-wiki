import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** 상대경로 .md 링크인지 판정한다. 절대경로·외부 URL·다른 확장자는 제외. */
function isRelativeMarkdownLink(href) {
  if (!href) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false // http:, https:, mailto: 등
  if (href.startsWith('/') || href.startsWith('#')) return false
  return /\.md(#.*)?$/.test(href)
}

/**
 * markdown-it 플러그인.
 * 렌더 시점이 아니라 core 체인에서 토큰을 바꾼다. VitePress가 자체 링크 플러그인으로
 * href를 라우트 경로로 재작성하기 전에 원본 href를 봐야 하기 때문이다.
 *
 * @param {import('markdown-it')} md
 * @param {{ root: string, exists?: (absPath: string) => boolean }} opts
 */
export function plannedLinks(md, { root, exists = existsSync }) {
  md.core.ruler.push('planned_links', (state) => {
    const relativePath = state.env?.relativePath
    if (!relativePath) return

    const pageDir = dirname(join(root, relativePath))

    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue

      let insidePlanned = false
      for (const token of blockToken.children) {
        if (token.type === 'link_open') {
          const href = token.attrGet('href')
          if (!isRelativeMarkdownLink(href)) continue

          const target = resolve(pageDir, href.replace(/#.*$/, ''))
          if (exists(target)) continue

          token.type = 'html_inline'
          token.tag = ''
          token.attrs = null
          token.content = '<span class="planned-link" data-planned>'
          insidePlanned = true
          continue
        }

        if (token.type === 'link_close' && insidePlanned) {
          token.type = 'html_inline'
          token.tag = ''
          token.attrs = null
          token.content = '</span>'
          insidePlanned = false
        }
      }
    }
  })
}
