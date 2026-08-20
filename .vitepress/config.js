import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, ADSENSE_CLIENT } from './lib/site.js'
import { buildSidebar } from './lib/sidebar.js'
import { plannedLinks } from './lib/planned-links.js'
import { renderForSearch } from './lib/search-render.js'
import { midContentAd } from './lib/mid-content-ad.js'
import { pageHead } from './lib/seo.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default withMermaid(defineConfig({
  lang: 'ko-KR',
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  cleanUrls: true,

  // srcDir이 저장소 루트이므로, 제외하지 않으면 내부 작업 문서가 사이트에 실린다.
  srcExclude: [
    'README.md',
    'docs/**',
    '.superpowers/**',
    'node_modules/**'
  ],

  head: [
    ...(ADSENSE_CLIENT
      ? [
          [
            'script',
            {
              async: '',
              crossorigin: 'anonymous',
              src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
            }
          ]
        ]
      : []),
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],

    // 파비콘 — .ico를 먼저 두어 구형 브라우저가 집고, svg를 지원하는 브라우저는
    // 뒤의 선언을 우선한다(선명하고 다크모드에서도 같은 색으로 보인다).
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    // iOS는 자체 둥근 마스크를 씌우므로 이 PNG만 모서리가 각진 변형이다.
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    // 안드로이드 홈화면 추가용. icon-192/512가 여기서만 참조되므로 이 줄을 지우면
    // 두 파일이 고아가 된다 — 함께 지울 것.
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#3451b2' }]
  ],

  themeConfig: {
    nav: [
      { text: '목차', link: '/part1-basics/1-1-what-is-stock' },
      { text: '이 책은', link: '/about/disclaimer' }
    ],

    footer: {
      message:
        '<a href="/about/privacy">개인정보처리방침</a> · <a href="/about/disclaimer">면책조항</a> · <a href="/about/contact">문의</a>',
      copyright: '이 사이트의 글은 투자 권유가 아니에요. 제도와 세금은 바뀔 수 있어요.'
    },

    sidebar: buildSidebar({ root: ROOT }),
    outline: { level: [2, 3], label: '이 페이지' },
    docFooter: { prev: '이전', next: '다음' },
    darkModeSwitchLabel: '다크 모드',
    returnToTopLabel: '맨 위로',
    sidebarMenuLabel: '목차',

    search: {
      provider: 'local',
      options: {
        _render: renderForSearch,
        // fuzzy 기본값 0.2는 `나스닥`↔`코스닥`을 섞는다. MiniSearch의 허용 편집거리는
        // round(글자수 × fuzzy)이므로 0.2는 세 글자 질의에도 거리 1을 허용한다.
        // 0.1로 낮추면 네 글자 이하는 정확·prefix 일치만 남고, 다섯 글자 이상은
        // 거리 1이 그대로 유지된다(`조각투자란`→`조각투자`가 계속 걸린다).
        // 매칭 집합이 기존의 부분집합이라 새 오탐이 생길 수 없다.
        // ⚠️ 이 값을 바꾸면 tests/helpers/search-index.js의 SEARCH_OPTIONS도 함께 고칠 것.
        miniSearch: {
          searchOptions: { fuzzy: 0.1 }
        },
        translations: {
          button: { buttonText: '검색', buttonAriaLabel: '검색' },
          modal: {
            displayDetails: '상세 보기',
            resetButtonTitle: '검색어 지우기',
            backButtonTitle: '닫기',
            noResultsText: '검색 결과가 없어요',
            footer: {
              selectText: '선택',
              navigateText: '이동',
              closeText: '닫기'
            }
          }
        }
      }
    }
  },

  // 계획된 미집필 챕터 링크는 plannedLinks가 처리한다.
  // 여기 걸리는 건 진짜 오타 링크이므로 빌드를 세운다.
  ignoreDeadLinks: false,

  markdown: {
    config(md) {
      md.use(plannedLinks, { root: ROOT })
      md.use(midContentAd, { minSections: 4, beforeSection: 3 })
    }
  },

  sitemap: {
    hostname: SITE_URL
  },

  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(...pageHead(pageData))
  }
}))
