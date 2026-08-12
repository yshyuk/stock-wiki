import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import MiniSearch from 'minisearch'
import { PARTS } from '../../.vitepress/lib/chapters.js'

const ROOT = new URL('../../', import.meta.url).pathname
// chapters.js의 PARTS에서 파생한다. 하드코딩하면 새 파트(예: 파트 3)가 생겨도 measure:search가
// 그 파트를 보지 못한 채 예전 13개 챕터만으로 재측정 결과를 만들어 낸다.
const PART_DIRS = PARTS.map((p) => p.dir)

/**
 * 실제 사이트의 searchOptions를 모사한다.
 * VPLocalSearchBox.vue의 기본값 위에 `.vitepress/config.js`의
 * `search.options.miniSearch.searchOptions`가 덮이는 구조라 그 결과를 여기 적는다.
 * ⚠️ 한쪽만 고치면 측정이 사이트와 어긋난다. 반드시 두 곳을 함께 고칠 것.
 */
export const SEARCH_OPTIONS = {
  fuzzy: 0.1, // 기본값 0.2 → 0.1 (config.js에서 덮어씀). 이유는 그쪽 주석 참고

  prefix: true,
  boost: { title: 4, text: 2, titles: 1 }
}

/**
 * frontmatter의 `keywords`를 파싱한다. 인라인 배열(`keywords: ["a", "b"]`)과
 * YAML 블록 시퀀스(`keywords:\n  - a\n  - b`) 둘 다 지원한다.
 * @param {string} fmText frontmatter 블록 내부 텍스트 (--- 제외)
 * @returns {string[]}
 */
function parseKeywords(fmText) {
  if (!fmText) return []

  const inline = fmText.match(/^keywords:\s*\[(.*)\]\s*$/m)
  if (inline) {
    return inline[1]
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }

  const lines = fmText.split('\n')
  const startIdx = lines.findIndex((l) => /^keywords:\s*$/.test(l))
  if (startIdx === -1) return []

  const keywords = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*-\s*(.+?)\s*$/)
    if (!m) break
    keywords.push(m[1].replace(/^"|"$/g, ''))
  }
  return keywords
}

/** frontmatter를 떼고 본문만, 마크다운 기호는 러프하게 제거한다. */
function loadChapters() {
  const docs = []
  let id = 0
  for (const dir of PART_DIRS) {
    if (!existsSync(join(ROOT, dir))) continue
    for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.md'))) {
      const raw = readFileSync(join(ROOT, dir, file), 'utf8')
      const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
      const body = fm ? raw.slice(fm[0].length) : raw
      const title = fm?.[1].match(/^title:\s*"?(.*?)"?$/m)?.[1] ?? file
      const keywords = parseKeywords(fm?.[1])
      docs.push({
        id: id++,
        file: `${dir}/${file}`,
        title,
        titles: keywords.join(' '), // _render의 keywords 주입을 모사한다
        text: body.replace(/[#*`>|\-\[\]()]/g, ' ')
      })
    }
  }
  return docs
}

/**
 * 챕터 본문으로 색인을 만들고 검색 함수를 돌려준다.
 * @returns {{ docCount: number, search: (q: string) => string[] }}
 */
export function buildSearchModel() {
  const docs = loadChapters()
  const index = new MiniSearch({
    fields: ['title', 'titles', 'text'],
    storeFields: ['file']
  })
  index.addAll(docs)
  return {
    docCount: docs.length,
    search: (q) => index.search(q, SEARCH_OPTIONS).map((r) => r.file)
  }
}
