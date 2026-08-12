import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildSearchModel } from '../helpers/search-index.js'
import { CHAPTERS } from '../../.vitepress/lib/chapters.js'

const ROOT = new URL('../../', import.meta.url).pathname
const model = buildSearchModel()

test('색인에 원고가 있는 챕터가 모두, 그리고 그것만 들어간다', () => {
  // 고정된 13이라는 숫자 대신 실제로 원고 파일이 존재하는 챕터 수와 비교한다.
  // 파트 3이 집필되는 순간 13이 그대로 굳어 있으면 이 테스트가 거짓 실패를 낸다.
  const writtenCount = CHAPTERS.filter((c) => existsSync(join(ROOT, c.file))).length
  assert.equal(model.docCount, writtenCount)
})

// 조사가 붙은 본문을 잡는가 — 설계 7.4의 통과 필수 케이스
for (const [query, expected] of [
  ['공매도', 'part2-korea-market/2-7-short-selling.md'],
  ['배당락', 'part2-korea-market/2-3-dividend-basics.md'],
  ['서킷브레이커', 'part2-korea-market/2-6-price-limit-circuit-breaker.md'],
  ['액면분할', 'part2-korea-market/2-5-capital-increase-and-split.md']
]) {
  test(`조사 부착 케이스: "${query}" → ${expected}`, () => {
    const hits = model.search(query)
    assert.ok(hits.length > 0, `"${query}" 검색 결과가 없습니다`)
    assert.ok(
      hits.slice(0, 3).includes(expected),
      `"${query}" 상위 3건에 ${expected}이 없습니다. 실제: ${hits.slice(0, 3).join(', ')}`
    )
  })
}

// fuzzy 값의 양쪽 경계를 고정한다. 이 두 개가 함께 통과하는 구간이 곧 지금의 `fuzzy: 0.1`이다.
// 위로 올리면(0.2) 코스닥 오탐이 돌아오고, 더 내리면(0) 「X이란」 질의가 죽는다.

test('fuzzy 상한: "나스닥" 결과에 그 단어가 없는 챕터가 섞이지 않는다', () => {
  // 코스닥 챕터가 걸리던 오탐이 이 형태였다. 순위가 아니라 「그 단어를 실제로 쓰는가」로
  // 판정해야, 챕터가 늘어 순위가 밀려도 테스트가 거짓 통과하지 않는다.
  // (2-2는 3-5로 넘기는 링크 문장에 「나스닥」이 실제로 있어서 걸리는 게 맞다.)
  const strays = model
    .search('나스닥')
    .filter((f) => !readFileSync(join(ROOT, f), 'utf8').includes('나스닥'))
  assert.deepEqual(strays, [], `"나스닥"에 그 단어가 없는 챕터가 걸렸습니다(fuzzy 오탐)`)
})

test('fuzzy 하한: "조각투자란"이 편집거리 1로 7-2를 찾는다', () => {
  // 본문에는 「조각투자란」이라는 표기가 없고 「조각투자」만 있다. 즉 이 질의는 순전히
  // fuzzy로 걸리는 항목이라, fuzzy를 더 낮추면 여기가 가장 먼저 깨진다.
  const hits = model.search('조각투자란')
  assert.equal(hits[0], 'part7-trends/2026-fractional-investment-sto.md', `실제: ${hits.join(', ')}`)
})
