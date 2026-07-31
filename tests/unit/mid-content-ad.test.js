import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { midContentAd } from '../../.vitepress/lib/mid-content-ad.js'

function render(src) {
  const md = new MarkdownIt({ html: true })
  md.use(midContentAd, { minSections: 4, beforeSection: 3 })
  return md.render(src)
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
