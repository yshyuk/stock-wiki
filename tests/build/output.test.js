import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../../.vitepress/dist/', import.meta.url).pathname

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

test('완성된 13개 챕터가 모두 페이지로 생성된다', () => {
  const expected = [
    'part1-basics/1-1-what-is-stock.html',
    'part1-basics/1-2-open-brokerage-account.html',
    'part1-basics/1-3-how-to-buy-stocks.html',
    'part1-basics/1-4-trading-hours.html',
    'part1-basics/1-5-fees-and-taxes.html',
    'part1-basics/1-6-market-cap-price-volume.html',
    'part2-korea-market/2-1-kospi-vs-kosdaq.html',
    'part2-korea-market/2-2-how-kospi-index-works.html',
    'part2-korea-market/2-3-dividend-basics.html',
    'part2-korea-market/2-4-ipo-subscription.html',
    'part2-korea-market/2-5-capital-increase-and-split.html',
    'part2-korea-market/2-6-price-limit-circuit-breaker.html',
    'part2-korea-market/2-7-short-selling.html'
  ]
  const missing = expected.filter((p) => !existsSync(join(DIST, p)))
  assert.deepEqual(missing, [], `누락된 챕터 페이지: ${missing.join(', ')}`)
})

test('아직 집필하지 않은 챕터는 페이지가 생성되지 않는다', () => {
  const part3 = join(DIST, 'part3-us-overseas')
  if (!existsSync(part3)) return
  const htmls = readdirSync(part3).filter((f) => f.endsWith('.html'))
  assert.deepEqual(
    htmls,
    [],
    `미집필 챕터에 페이지가 생겼습니다: ${htmls.join(', ')}`
  )
})
