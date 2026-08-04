import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import MiniSearch from 'minisearch'

const ROOT = new URL('../../', import.meta.url).pathname
const PART_DIRS = ['part1-basics', 'part2-korea-market']

/** VitePress 로컬 검색의 기본 searchOptions (VPLocalSearchBox.vue 기준) */
export const SEARCH_OPTIONS = {
  fuzzy: 0.2,
  prefix: true,
  boost: { title: 4, text: 2, titles: 1 }
}

/** frontmatter를 떼고 본문만, 마크다운 기호는 러프하게 제거한다. */
function loadChapters() {
  const docs = []
  let id = 0
  for (const dir of PART_DIRS) {
    for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.md'))) {
      const raw = readFileSync(join(ROOT, dir, file), 'utf8')
      const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
      const body = fm ? raw.slice(fm[0].length) : raw
      const title = fm?.[1].match(/^title:\s*"?(.*?)"?$/m)?.[1] ?? file
      const kwLine = fm?.[1].match(/^keywords:\s*\[(.*)\]$/m)?.[1] ?? ''
      const keywords = kwLine
        .split(',')
        .map((s) => s.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
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
