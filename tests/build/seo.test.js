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
    'https://digestive-coffee.com/part2-korea-market/2-7-short-selling',
    'https://digestive-coffee.com/about/privacy',
    'https://digestive-coffee.com/about/disclaimer',
    'https://digestive-coffee.com/about/contact'
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
    const url = `https://digestive-coffee.com/${chapter.file.replace(/\.md$/, '')}`
    const inSitemap = xml.includes(url)
    if (mdExists !== inSitemap) {
      mismatches.push(`${chapter.file}: 원고 존재=${mdExists}, sitemap 포함=${inSitemap}`)
    }
  }
  assert.deepEqual(mismatches, [], `원고-sitemap 불일치: ${mismatches.join('; ')}`)
})

test('robots.txt가 sitemap을 가리킨다', () => {
  const txt = readFileSync(join(DIST, 'robots.txt'), 'utf8')
  assert.match(txt, /Sitemap: https:\/\/digestive-coffee\.com\/sitemap\.xml/)
})

test('챕터 페이지에 canonical과 og 태그가 있다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/digestive-coffee\.com\/part2-korea-market\/2-7-short-selling">/
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

test('아이콘·공유 이미지 정적 파일이 산출물에 있다', () => {
  // public/의 파일이 조용히 사라지면 파비콘과 SNS 썸네일이 함께 죽는데,
  // 화면상으로는 눈치채기 어려워 여기서 잡는다.
  for (const f of [
    'favicon.ico',
    'favicon.svg',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'og-image.png',
    'site.webmanifest'
  ]) {
    assert.ok(existsSync(join(DIST, f)), `${f}가 산출물에 없습니다`)
  }
})

test('챕터 페이지에 파비콘과 og:image가 붙는다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg">/)
  assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/)
  // og:image는 절대 URL이어야 한다. 상대 경로면 공유 썸네일이 안 뜬다.
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/digestive-coffee\.com\/og-image\.png">/
  )
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/)
})
