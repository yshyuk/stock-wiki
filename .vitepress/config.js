import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { SITE_TITLE, SITE_DESCRIPTION } from './lib/site.js'
import { buildSidebar } from './lib/sidebar.js'

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
    sidebarMenuLabel: '목차'
  },

  // Task 3에서 planned-links 플러그인을 붙이면서 false로 되돌린다.
  // 지금은 미집필 챕터를 가리키는 링크 14곳 때문에 빌드가 실패한다.
  ignoreDeadLinks: true
})
