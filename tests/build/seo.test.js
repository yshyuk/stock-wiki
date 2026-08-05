import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CHAPTERS } from '../../.vitepress/lib/chapters.js'

const DIST = new URL('../../.vitepress/dist/', import.meta.url).pathname
const ROOT = new URL('../../', import.meta.url).pathname
const CHAPTER = join(DIST, 'part2-korea-market/2-7-short-selling.html')

test('sitemap.xml이 생성된다', () => {
  const path = join(DIST, 'sitemap.xml')
  assert.ok(existsSync(path), 'sitemap.xml이 없습니다')
  const xml = readFileSync(path, 'utf8')

  // 리터럴은 의도적이다. SITE_URL을 import해 조립하면 상수가 잘못 바뀌어도
  // 기대값이 함께 움직여 동어반복이 되어 아무것도 검증하지 못한다.
  for (const url of [
    'https://stock-wiki.digestive-coffee.blog/part2-korea-market/2-7-short-selling',
    'https://stock-wiki.digestive-coffee.blog/about/privacy',
    'https://stock-wiki.digestive-coffee.blog/about/disclaimer',
    'https://stock-wiki.digestive-coffee.blog/about/contact'
  ]) {
    assert.ok(xml.includes(url), `sitemap에 ${url}이 없습니다`)
  }
})

test('sitemap은 원고가 있는 챕터만 담고, 없는 챕터는 담지 않는다', () => {
  // 고정된 'part3-us-overseas' 문자열 대신 CHAPTERS + 실제 원고 존재 여부로 판단한다.
  // 파트 3이 집필되는 순간에도 이 불변식은 계속 참이어야 한다.
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
  const mismatches = []
  for (const chapter of CHAPTERS) {
    const mdExists = existsSync(join(ROOT, chapter.file))
    const url = `https://stock-wiki.digestive-coffee.blog/${chapter.file.replace(/\.md$/, '')}`
    const inSitemap = xml.includes(url)
    if (mdExists !== inSitemap) {
      mismatches.push(`${chapter.file}: 원고 존재=${mdExists}, sitemap 포함=${inSitemap}`)
    }
  }
  assert.deepEqual(mismatches, [], `원고-sitemap 불일치: ${mismatches.join('; ')}`)
})

test('robots.txt가 sitemap을 가리킨다', () => {
  const txt = readFileSync(join(DIST, 'robots.txt'), 'utf8')
  assert.match(txt, /Sitemap: https:\/\/stock-wiki\.digestive-coffee\.blog\/sitemap\.xml/)
})

test('챕터 페이지에 canonical과 og 태그가 있다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/stock-wiki\.digestive-coffee\.blog\/part2-korea-market\/2-7-short-selling">/
  )
  assert.match(html, /property="og:type" content="article"/)
  assert.match(html, /property="og:locale" content="ko_KR"/)
})

test('챕터 페이지의 meta description이 frontmatter description이다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  assert.match(html, /<meta name="description" content="공매도는 갖고 있지 않은 주식을/)
})

test('챕터 페이지에 JSON-LD가 있고 파싱된다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  )
  assert.ok(match, 'JSON-LD script 태그가 없습니다')
  const data = JSON.parse(match[1])
  assert.equal(data['@graph'][0]['@type'], 'Article')
  assert.equal(data['@graph'][0].datePublished, '2026-07-28')
})
