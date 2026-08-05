import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { CHAPTERS } from '../../.vitepress/lib/chapters.js'

const DIST = new URL('../../.vitepress/dist/', import.meta.url).pathname
const ROOT = new URL('../../', import.meta.url).pathname

test('빌드 산출물이 존재한다', () => {
  assert.ok(
    existsSync(DIST),
    '.vitepress/dist 가 없습니다. `npm run build`를 먼저 실행하세요.'
  )
})

test('내부 작업 문서가 산출물에 포함되지 않는다', () => {
  const leaked = []
  for (const path of ['docs', 'superpowers', 'README.html', 'handoffs.html']) {
    if (existsSync(join(DIST, path))) leaked.push(path)
  }
  assert.deepEqual(
    leaked,
    [],
    `내부 문서가 사이트에 실렸습니다: ${leaked.join(', ')}`
  )
})

test('챕터는 원고(.md) 파일이 있을 때만, 그리고 있으면 반드시 페이지가 생긴다', () => {
  // 오늘 13개인 고정 목록 대신 CHAPTERS + 실제 원고 존재 여부로 판단한다.
  // 파트 3이 집필되는 순간에도 이 불변식(원고가 있으면 페이지가 있고, 없으면 없다)은 계속
  // 참이어야 하므로, 챕터가 늘어나도 이 테스트를 고쳐 쓸 필요가 없다.
  const mismatches = []
  for (const chapter of CHAPTERS) {
    const mdExists = existsSync(join(ROOT, chapter.file))
    const htmlPath = join(DIST, chapter.file.replace(/\.md$/, '.html'))
    const htmlExists = existsSync(htmlPath)
    if (mdExists !== htmlExists) {
      mismatches.push(
        `${chapter.file}: 원고 존재=${mdExists}, 페이지 존재=${htmlExists}`
      )
    }
  }
  assert.deepEqual(mismatches, [], `원고-페이지 불일치: ${mismatches.join('; ')}`)
})
