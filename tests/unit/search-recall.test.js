import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSearchModel } from '../helpers/search-index.js'

const model = buildSearchModel()

test('색인에 완성된 13개 챕터가 모두 들어간다', () => {
  assert.equal(model.docCount, 13)
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
