import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { plannedLinks } from '../../.vitepress/lib/planned-links.js'

const ROOT = '/repo'
const written = new Set([
  '/repo/part1-basics/1-3-how-to-buy-stocks.md',
  '/repo/part2-korea-market/2-4-ipo-subscription.md'
])

function render(src, relativePath) {
  const md = new MarkdownIt()
  md.use(plannedLinks, { root: ROOT, exists: (p) => written.has(p) })
  return md.render(src, { relativePath })
}

test('집필된 챕터 링크는 그대로 둔다', () => {
  const html = render(
    '[1-3](../part1-basics/1-3-how-to-buy-stocks.md)에서 다뤄요.',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="\.\.\/part1-basics\/1-3-how-to-buy-stocks\.md">1-3<\/a>/)
})

test('같은 폴더의 집필된 챕터 링크도 그대로 둔다', () => {
  const html = render(
    '[2-4](2-4-ipo-subscription.md) 참고',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="2-4-ipo-subscription\.md">2-4<\/a>/)
})

test('미집필 챕터 링크는 span으로 바뀐다', () => {
  const html = render(
    '[3-3](../part3-us-overseas/3-3-us-stock-tax.md)에서 다뤄요.',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.doesNotMatch(html, /<a /)
  assert.match(html, /<span class="planned-link" data-planned>3-3<\/span>/)
})

test('앵커가 붙은 미집필 링크도 처리한다', () => {
  const html = render(
    '[세금](../part3-us-overseas/3-3-us-stock-tax.md#핵심-답변)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<span class="planned-link" data-planned>세금<\/span>/)
})

test('외부 링크는 건드리지 않는다', () => {
  const html = render(
    '[KRX](https://regulation.krx.co.kr/contents/RGL/03/index.md)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="https:\/\/regulation\.krx\.co\.kr/)
})

test('.md가 아닌 링크는 건드리지 않는다', () => {
  const html = render(
    '[이미지](images/chart.png)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="images\/chart\.png">/)
})

test('링크 안의 강조 표시는 보존된다', () => {
  const html = render(
    '[**3-3**](../part3-us-overseas/3-3-us-stock-tax.md)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<span class="planned-link" data-planned><strong>3-3<\/strong><\/span>/)
})
