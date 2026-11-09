import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'

const DIST = new URL('../../.vitepress/dist/', import.meta.url).pathname
const ROOT = new URL('../../', import.meta.url).pathname

function walkHtml(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'assets') return []
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return walkHtml(full)
    return entry.name.endsWith('.html') ? [full] : []
  })
}

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

/** `/part1/1-1` 형태의 경로 → 페이지 HTML. 디렉터리 인덱스는 `/about/`로 등록한다. */
function loadPages() {
  const pages = new Map()
  for (const file of walkHtml(DIST)) {
    const route = `/${relative(DIST, file).replace(/\.html$/, '').replace(/(^|\/)index$/, '$1')}`
    pages.set(route, readFileSync(file, 'utf8'))
  }
  return pages
}

function articleOf(html) {
  return html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? ''
}

test('내부 링크는 실제 페이지와 앵커로 연결된다', () => {
  // VitePress의 dead link 검사는 페이지 존재만 본다. 앵커 오타는 여기서만 잡힌다.
  const pages = loadPages()
  const broken = []
  for (const [route, html] of pages) {
    for (const [, rawHref] of articleOf(html).matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
      const href = decode(rawHref)
      if (/^[a-z]+:/i.test(href)) continue
      const [path, hash] = href.split('#')
      const target = path ? posix.resolve(posix.dirname(route), path).replace(/\.html$/, '') : route
      const page = pages.get(target) ?? pages.get(`${target}/`)
      if (!page) {
        broken.push(`${route} → ${href}`)
      } else if (hash && !page.includes(`id="${hash}"`) && !decode(page).includes(`id="${decodeURIComponent(hash)}"`)) {
        broken.push(`${route} → ${href} (앵커 없음)`)
      }
    }
  }
  assert.deepEqual(broken, [])
})

test('도표 로딩이 실패해도 mermaid 오류 화면을 독자에게 노출하지 않는다', () => {
  // mermaid는 청크 로딩·그리기 실패까지 전부 「Syntax error in text」로 그린다.
  const assets = join(DIST, 'assets')
  const found = readdirSync(assets, { recursive: true })
    .filter((name) => String(name).endsWith('.js'))
    .some((name) => /suppressErrorRendering["']?:\s*(!0|true)/.test(readFileSync(join(assets, String(name)), 'utf8')))
  assert.ok(found, 'mermaid 설정에 suppressErrorRendering: true가 없습니다')
})

test('mermaid 자동 실행이 꺼져 있어 빈 도표 자리를 먼저 그리지 않는다', () => {
  // window load가 플러그인의 initialize보다 먼저 오면 mermaid가 빈 .mermaid div를 직접 그리다
  // 실패하고, 그 오류 화면이 플러그인의 정상 결과를 덮어쓸 수 있다.
  const assets = join(DIST, 'assets')
  const found = readdirSync(assets, { recursive: true })
    .filter((name) => String(name).endsWith('.js'))
    .some((name) => /\.startOnLoad\s*=\s*(!1|false)/.test(readFileSync(join(assets, String(name)), 'utf8')))
  assert.ok(found, 'mermaid.startOnLoad를 끄는 코드가 번들에 없습니다')
})

test('글 페이지 본문 끝에서 정책 페이지로 갈 수 있다', () => {
  // VitePress는 사이드바가 있는 페이지에서 전역 footer를 숨긴다.
  const html = readFileSync(join(DIST, 'part3-us-overseas/3-3-us-stock-tax.html'), 'utf8')
  const block = html.match(/class="doc-site-links"[\s\S]*?<\/div>/)?.[0]
  assert.ok(block, '글 페이지에 doc-site-links 블록이 없습니다')
  for (const href of ['/about/"', '/about/privacy"', '/about/disclaimer"', '/about/contact"']) {
    assert.ok(block.includes(`href="${href}`), `${href} 링크가 없습니다`)
  }
})

test('홈에서 읽기 순서와 파트별·주제별 안내로 탐색할 수 있다', () => {
  const html = readFileSync(join(DIST, 'index.html'), 'utf8')
  for (const heading of ['처음이라면 이 순서로', '파트별 안내', '주제로 바로 찾기']) {
    assert.ok(html.includes(heading), `홈에 「${heading}」 절이 없습니다`)
  }
  for (const part of ['part1-basics', 'part2-korea-market', 'part3-us-overseas', 'part4-etf-pension', 'part5-analysis', 'part6-common-sense', 'part7-trends']) {
    assert.ok(html.includes(`href="/${part}/`), `홈에 ${part} 링크가 없습니다`)
  }
  assert.ok(!html.includes('인기 글'), '공개 실적 없이 「인기 글」 표현을 쓰면 안 됩니다')
})

const SOURCED_CHAPTERS = [
  'part1-basics/1-4-trading-hours.md',
  'part1-basics/1-5-fees-and-taxes.md',
  'part3-us-overseas/3-2-us-trading-hours.md',
  'part3-us-overseas/3-3-us-stock-tax.md',
  'part4-etf-pension/4-5-isa-account.md',
  'part4-etf-pension/4-6-tax-account-priority.md'
]

function frontmatterDate(source, key) {
  return source.match(new RegExp(`^${key}:\\s*(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1]
}

function sourcedFiles() {
  const pension = readdirSync(join(ROOT, 'part4-etf-pension')).find((name) => name.startsWith('4-4-'))
  const part7 = readdirSync(join(ROOT, 'part7-trends'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => `part7-trends/${name}`)
    .filter((path) => readFileSync(join(ROOT, path), 'utf8').includes('토큰증권이란'))
  return [...SOURCED_CHAPTERS, `part4-etf-pension/${pension}`, ...part7]
}

test('세금·제도 핵심 글은 직접 출처·기준일·확인일을 밝힌다', () => {
  for (const path of sourcedFiles()) {
    const source = readFileSync(join(ROOT, path), 'utf8')
    const section = source.split(/^## 공식 출처\s*$/m)[1]?.split(/^(## |---$)/m)[0]
    assert.ok(section, `${path}: 「공식 출처」 절이 없습니다`)
    const items = section.split('\n').filter((line) => line.startsWith('- '))
    assert.ok(items.length > 0, `${path}: 출처 항목이 없습니다`)
    for (const item of items) {
      assert.match(item, /\]\(https:\/\/[^)]+\/[^)]+\)/, `${path}: 문서 직접 링크가 없습니다 — ${item}`)
      assert.match(item, /((기준|시행|발표|공포|개정|게시) \d{4}|기준일 표시 없음)/, `${path}: 기준일·시행일이 없습니다 — ${item}`)
      assert.match(item, /확인 \d{4}-\d{2}-\d{2}/, `${path}: 확인일이 없습니다 — ${item}`)
    }
  }
})

test('출처를 보강한 글의 수정일과 구조화 데이터가 일치한다', () => {
  for (const path of sourcedFiles()) {
    const source = readFileSync(join(ROOT, path), 'utf8')
    const updated = frontmatterDate(source, 'updated')
    assert.ok(updated, `${path}: updated가 없습니다`)
    const html = readFileSync(join(DIST, path.replace(/\.md$/, '.html')), 'utf8')
    assert.ok(html.includes(`"dateModified":"${updated}"`), `${path}: dateModified 불일치`)
    assert.ok(existsSync(join(ROOT, dirname(path))))
  }
})
