import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { SITE_TITLE, SITE_DESCRIPTION } from './lib/site.js'
import { buildSidebar } from './lib/sidebar.js'
import { plannedLinks } from './lib/planned-links.js'
import { renderForSearch } from './lib/search-render.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig({
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

  themeConfig: {
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
    }
  }
})
