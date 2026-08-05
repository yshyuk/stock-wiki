import { test } from 'node:test'
import assert from 'node:assert/strict'
import { injectKeywords, renderForSearch } from '../../.vitepress/lib/search-render.js'

test('첫 h1 뒤에 keywords 문단을 넣는다', () => {
  const html = '<h1>공매도란</h1>\n<p>본문</p>'
  const out = injectKeywords(html, ['공매도란', '공매도 뜻'])
  assert.equal(
    out,
    '<h1>공매도란</h1>\n<p class="search-keywords">공매도란 공매도 뜻</p>\n<p>본문</p>'
  )
})

test('h1이 없으면 맨 앞에 넣는다', () => {
  const out = injectKeywords('<p>본문</p>', ['ETF'])
  assert.equal(out, '<p class="search-keywords">ETF</p>\n<p>본문</p>')
})

test('keywords가 없으면 원본을 그대로 돌려준다', () => {
  const html = '<h1>제목</h1>'
  assert.equal(injectKeywords(html, []), html)
  assert.equal(injectKeywords(html, undefined), html)
})

test('두 번째 h1이 있어도 첫 번째에만 넣는다', () => {
  const out = injectKeywords('<h1>A</h1><h1>B</h1>', ['키워드'])
  assert.equal(out, '<h1>A</h1>\n<p class="search-keywords">키워드</p>\n<h1>B</h1>')
})

test('HTML 특수문자가 든 keywords를 이스케이프한다', () => {
  const out = injectKeywords('<h1>A</h1>', ['S&P500 <지수>'])
  assert.match(out, /S&amp;P500 &lt;지수&gt;/)
})

test('frontmatter.search가 false면 빈 문자열을 돌려준다 (색인 제외)', () => {
  const fakeMd = { render: () => '<h1>제목</h1><p>본문</p>' }
  const out = renderForSearch('# 제목\n\n본문', { frontmatter: { search: false } }, fakeMd)
  assert.equal(out, '')
})

test('frontmatter.search가 false가 아니면 평소대로 렌더한다', () => {
  const fakeMd = { render: () => '<h1>제목</h1><p>본문</p>' }
  const out = renderForSearch('# 제목\n\n본문', { frontmatter: {} }, fakeMd)
  assert.equal(out, '<h1>제목</h1><p>본문</p>')
})
