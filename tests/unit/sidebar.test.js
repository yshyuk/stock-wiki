import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSidebar } from '../../.vitepress/lib/sidebar.js'
import { CHAPTERS, PARTS } from '../../.vitepress/lib/chapters.js'

const ROOT = '/repo'

// 파트 1·2만 집필된 상태를 흉내낸다.
const writtenFiles = new Set(
  CHAPTERS.filter((c) => c.part <= 2).map((c) => `${ROOT}/${c.file}`)
)
const exists = (p) => writtenFiles.has(p)

test('파트 7개가 모두 그룹으로 나온다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  assert.equal(sidebar.length, PARTS.length)
  assert.equal(sidebar[0].text, '파트 1. 주식 투자, 처음이라면')
})

test('40개 챕터가 전부 표시된다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  const total = sidebar.reduce((n, group) => n + group.items.length, 0)
  assert.equal(total, 40)
})

test('집필된 챕터만 link를 갖는다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  const items = sidebar.flatMap((g) => g.items)
  const linked = items.filter((i) => i.link)
  assert.equal(linked.length, 13)
})

test('link는 확장자 없는 절대경로다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  const item = sidebar[1].items.at(-1)
  assert.equal(item.link, '/part2-korea-market/2-7-short-selling')
})

test('미집필 챕터는 link 없이 제목만 남는다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  const part3 = sidebar[2].items
  assert.equal(part3.every((i) => i.link === undefined), true)
  assert.equal(part3[0].text, '미국주식, 왜 하는가')
})

test('집필된 파트는 펼쳐지고 미집필 파트는 접힌다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  assert.equal(sidebar[0].collapsed, false)
  assert.equal(sidebar[2].collapsed, true)
})

test('목차 데이터에 없는 파트 7 파일도 목록에 붙는다', () => {
  const extraFile = `${ROOT}/part7-trends/2027-q1-outlook.md`
  const sidebar = buildSidebar({
    root: ROOT,
    exists: (p) => writtenFiles.has(p) || p === extraFile,
    listDir: (p) => (p.endsWith('part7-trends') ? ['2027-q1-outlook.md'] : [])
  })
  const part7 = sidebar[6].items
  assert.equal(part7.some((i) => i.link === '/part7-trends/2027-q1-outlook'), true)
})

test('목차 데이터에 없는 파트 1~6 파일은 경고로 보고된다', () => {
  const warnings = []
  buildSidebar({
    root: ROOT,
    exists: (p) => writtenFiles.has(p) || p === `${ROOT}/part1-basics/1-7-bonus.md`,
    listDir: (p) => (p.endsWith('part1-basics') ? ['1-7-bonus.md'] : []),
    warn: (msg) => warnings.push(msg)
  })
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /part1-basics\/1-7-bonus\.md/)
})
