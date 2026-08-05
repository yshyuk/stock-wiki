import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
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
