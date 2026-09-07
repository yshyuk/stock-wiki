import { SITE_URL, SITE_TITLE, AUTHOR_NAME, AUTHOR_URL } from './site.js'

/** SNS 공유 썸네일. 페이지마다 따로 만들지 않고 사이트 대표 한 장을 공유한다. */
const OG_IMAGE = `${SITE_URL}/og-image.png`

/** `part2-korea-market/2-7-short-selling.md` → 절대 URL */
export function canonicalUrl(relativePath) {
  const path = relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')
  return `${SITE_URL}/${path}`
}

/** YAML에서 Date 객체로 파싱될 수 있는 값을 `2026-07-28` 형태 문자열로 정규화한다. */
function toDateString(value) {
  if (!value) return undefined
  const s = value instanceof Date ? value.toISOString() : String(value)
  return s.slice(0, 10)
}

function articleGraph(pageData, url, title) {
  const { frontmatter: fm } = pageData

  // 파트 랜딩 페이지가 없으므로 중간 노드(파트)를 만들지 않는다 — 사이트 → 챕터 2단계.
  // 중간 ListItem에 item(URL)이 없으면 Google이 BreadcrumbList 자체를 무효로 본다.
  const breadcrumb = [
    { '@type': 'ListItem', position: 1, name: SITE_TITLE, item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: title, item: url }
  ]

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description: fm.description,
        datePublished: toDateString(fm.date),
        // 수정일이 없으면 작성일을 그대로 쓴다. Google은 dateModified가 빠진 Article을
        // 갱신 이력이 없는 글로 보는데, 그건 사실이므로 작성일과 같게 두는 것이 맞다.
        dateModified: toDateString(fm.updated) ?? toDateString(fm.date),
        author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
        publisher: { '@type': 'Organization', name: SITE_TITLE, url: `${SITE_URL}/` },
        inLanguage: 'ko-KR',
        mainEntityOfPage: url,
        isPartOf: { '@type': 'Book', name: SITE_TITLE, url: `${SITE_URL}/` },
        ...(fm.keywords?.length ? { keywords: fm.keywords.join(', ') } : {})
      },
      { '@type': 'BreadcrumbList', itemListElement: breadcrumb }
    ]
  }
}

/**
 * 페이지 하나에 붙일 head 태그 배열을 만든다.
 * VitePress의 transformPageData에서 frontmatter.head에 밀어 넣는다.
 */
export function pageHead(pageData) {
  const fm = pageData.frontmatter ?? {}
  const url = canonicalUrl(pageData.relativePath)
  const title = fm.title ?? pageData.title ?? SITE_TITLE
  const description = fm.description ?? pageData.description ?? ''
  const isChapter = typeof fm.part === 'number' && typeof fm.order === 'number'

  const head = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: isChapter ? 'article' : 'website' }],
    ['meta', { property: 'og:locale', content: 'ko_KR' }],
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    // og:image는 절대 URL이어야 한다 — 크롤러가 상대 경로를 해석하지 않는 곳이 있다.
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: SITE_TITLE }],
    // 이미지가 있으므로 큰 카드를 쓴다. 이미지 없이 이 값을 쓰면 카드가 깨진다.
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }]
  ]

  if (isChapter && fm.date) {
    head.push(['meta', { property: 'article:published_time', content: toDateString(fm.date) }])
  }
  if (isChapter && fm.updated) {
    head.push(['meta', { property: 'article:modified_time', content: toDateString(fm.updated) }])
  }
  if (isChapter) {
    head.push(['meta', { name: 'author', content: AUTHOR_NAME }])
  }

  if (isChapter) {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(articleGraph(pageData, url, title))
    ])
  }

  return head
}
