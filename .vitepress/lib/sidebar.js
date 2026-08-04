import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CHAPTERS, PARTS } from './chapters.js'

/** `part2-korea-market/2-7-short-selling.md` → `/part2-korea-market/2-7-short-selling` */
function toLink(file) {
  return '/' + file.replace(/\.md$/, '')
}

/** 파일시스템 접근은 전부 주입 가능하게 둔다. 테스트가 실제 디스크에 의존하지 않아야 한다. */
function defaultListDir(absPath) {
  return existsSync(absPath) ? readdirSync(absPath) : []
}

/**
 * @param {{
 *   root: string,
 *   exists?: (absPath: string) => boolean,
 *   listDir?: (absPath: string) => string[],
 *   warn?: (message: string) => void
 * }} opts
 */
export function buildSidebar({
  root,
  exists = existsSync,
  listDir = defaultListDir,
  warn = (m) => console.warn(m)
}) {
  const known = new Set(CHAPTERS.map((c) => c.file))

  // 파트 7은 목차가 고정되지 않은 수시 추가 파트다.
  // 목차 데이터에 없는 파일이 있으면 파일명 순으로 뒤에 붙인다.
  const part7Dir = PARTS.find((p) => p.part === 7).dir
  const extras = listDir(join(root, part7Dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `${part7Dir}/${f}`)
    .filter((f) => !known.has(f))
    .sort()

  // 파트 1~6은 목차가 확정되어 있다. 데이터에 없는 파일이 있으면 목차와 파일이
  // 어긋난 것이므로 경고한다. 목차가 이 데이터와 README, 선행 설계 문서
  // 세 곳에 중복 존재하는 동안의 유일한 자동 검증 지점이다.
  for (const part of PARTS.filter((p) => p.part !== 7)) {
    for (const file of listDir(join(root, part.dir))) {
      if (!file.endsWith('.md')) continue
      const rel = `${part.dir}/${file}`
      if (!known.has(rel)) {
        warn(`[sidebar] 목차 데이터에 없는 챕터 파일: ${rel} — chapters.js를 확인하세요`)
      }
    }
  }

  return PARTS.map((part) => {
    const items = CHAPTERS.filter((c) => c.part === part.part)
      .sort((a, b) => a.order - b.order)
      .map((c) =>
        exists(join(root, c.file))
          ? { text: c.title, link: toLink(c.file) }
          : { text: c.title }
      )

    if (part.part === 7) {
      for (const file of extras) {
        items.push({ text: file.replace(/^.*\/|\.md$/g, ''), link: toLink(file) })
      }
    }

    const anyWritten = items.some((i) => i.link)
    return { text: part.title, collapsed: !anyWritten, items }
  })
}
