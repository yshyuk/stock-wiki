import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { midContentAd } from '../../.vitepress/lib/mid-content-ad.js'

function render(src, env = { frontmatter: { part: 1, order: 1 } }) {
  const md = new MarkdownIt({ html: true })
  md.use(midContentAd, { minSections: 4, beforeSection: 3 })
  return md.render(src, env)
}

const withSections = (n) =>
  Array.from({ length: n }, (_, i) => `## 섹션 ${i + 1}\n\n본문 ${i + 1}\n`).join('\n')

test('섹션이 4개면 3번째 앞에 광고가 들어간다', () => {
  const html = render(withSections(4))
  const adIndex = html.indexOf('<AdSlot position="mid" />')
  const third = html.indexOf('섹션 3')
  const second = html.indexOf('섹션 2')
  assert.ok(adIndex > 0, '광고 슬롯이 삽입되지 않았습니다')
  assert.ok(adIndex > second && adIndex < third, '3번째 섹션 앞이 아닙니다')
})

test('섹션이 3개면 광고를 넣지 않는다', () => {
  assert.doesNotMatch(render(withSections(3)), /AdSlot/)
})

test('섹션이 6개여도 광고는 하나만 넣는다', () => {
  const html = render(withSections(6))
  assert.equal(html.split('<AdSlot position="mid" />').length - 1, 1)
})

test('h3는 세지 않는다', () => {
  const src = '## A\n\n### a1\n\n### a2\n\n## B\n\n### b1\n'
  assert.doesNotMatch(render(src), /AdSlot/)
})

test('h1은 세지 않는다', () => {
  const src = '# 제목\n\n## A\n\n## B\n\n## C\n'
  assert.doesNotMatch(render(src), /AdSlot/)
})

test('챕터가 아닌 페이지(frontmatter.part 없음)는 섹션이 많아도 광고를 넣지 않는다', () => {
  // about/privacy.md, about/disclaimer.md처럼 정책 페이지는 챕터가 아니므로
  // ##가 여러 개여도 mid-content 광고가 붙으면 안 된다.
  const html = render(withSections(6), { frontmatter: {} })
  assert.doesNotMatch(html, /AdSlot/)
})

test('frontmatter 자체가 없어도(env.frontmatter undefined) 광고를 넣지 않는다', () => {
  const html = render(withSections(6), {})
  assert.doesNotMatch(html, /AdSlot/)
})

test('챕터 페이지(frontmatter.part가 숫자)는 기존과 동일하게 광고가 들어간다', () => {
  const html = render(withSections(4), { frontmatter: { part: 2, order: 7 } })
  assert.match(html, /AdSlot/)
})
