import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canonicalUrl, pageHead } from '../../.vitepress/lib/seo.js'
import { SITE_URL } from '../../.vitepress/lib/site.js'

test('챕터의 canonical URL', () => {
  assert.equal(
    canonicalUrl('part2-korea-market/2-7-short-selling.md'),
    `${SITE_URL}/part2-korea-market/2-7-short-selling`
  )
})

test('루트 index의 canonical URL은 슬래시로 끝난다', () => {
  assert.equal(canonicalUrl('index.md'), `${SITE_URL}/`)
})

test('정책 페이지의 canonical URL', () => {
  assert.equal(canonicalUrl('about/privacy.md'), `${SITE_URL}/about/privacy`)
})

const chapterPage = {
  relativePath: 'part2-korea-market/2-7-short-selling.md',
  title: '공매도란 무엇이고 왜 논란인가',
  description: '공매도는 갖고 있지 않은 주식을 먼저 빌려서 팔고, 나중에 싸게 사서 갚아 그 차익을 노리는 거래예요.',
  frontmatter: {
    title: '공매도란 무엇이고 왜 논란인가',
    description: '공매도는 갖고 있지 않은 주식을 먼저 빌려서 팔고, 나중에 싸게 사서 갚아 그 차익을 노리는 거래예요.',
    keywords: ['공매도란', '공매도 뜻'],
    part: 2,
    order: 7,
    date: '2026-07-28'
  }
}

function findTag(head, tag, key, value) {
  return head.find(([t, attrs]) => t === tag && attrs[key] === value)
}

test('canonical link 태그가 들어간다', () => {
  const head = pageHead(chapterPage)
  const link = findTag(head, 'link', 'rel', 'canonical')
  assert.ok(link)
  assert.equal(link[1].href, `${SITE_URL}/part2-korea-market/2-7-short-selling`)
})

test('og 태그가 들어간다', () => {
  const head = pageHead(chapterPage)
  assert.equal(findTag(head, 'meta', 'property', 'og:type')[1].content, 'article')
  assert.equal(findTag(head, 'meta', 'property', 'og:locale')[1].content, 'ko_KR')
  assert.equal(
    findTag(head, 'meta', 'property', 'og:title')[1].content,
    '공매도란 무엇이고 왜 논란인가'
  )
  assert.match(
    findTag(head, 'meta', 'property', 'og:description')[1].content,
    /공매도는 갖고 있지 않은/
  )
})

test('작성일이 article:published_time으로 들어간다', () => {
  const head = pageHead(chapterPage)
  assert.equal(
    findTag(head, 'meta', 'property', 'article:published_time')[1].content,
    '2026-07-28'
  )
})

test('JSON-LD에 Article과 BreadcrumbList가 들어간다', () => {
  const head = pageHead(chapterPage)
  const script = head.find(([t, attrs]) => t === 'script' && attrs.type === 'application/ld+json')
  assert.ok(script)
  const data = JSON.parse(script[2])
  const types = data['@graph'].map((n) => n['@type'])
  assert.deepEqual(types, ['Article', 'BreadcrumbList'])
  const breadcrumb = data['@graph'][1].itemListElement
  assert.equal(breadcrumb.at(-1).name, '공매도란 무엇이고 왜 논란인가')
  assert.equal(breadcrumb[1].name, '파트 2. 국내 주식시장 이해하기')
})

test('챕터가 아닌 페이지는 og:type이 website고 JSON-LD가 없다', () => {
  const head = pageHead({
    relativePath: 'about/privacy.md',
    title: '개인정보처리방침',
    description: '이 사이트가 개인정보를 어떻게 다루는지 안내해요.',
    frontmatter: { title: '개인정보처리방침', description: '이 사이트가 개인정보를 어떻게 다루는지 안내해요.' }
  })
  assert.equal(findTag(head, 'meta', 'property', 'og:type')[1].content, 'website')
  assert.equal(
    head.some(([t, attrs]) => t === 'script' && attrs.type === 'application/ld+json'),
    false
  )
})
