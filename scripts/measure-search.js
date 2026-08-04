import { buildSearchModel } from '../tests/helpers/search-index.js'

const QUERIES = ['거래소', '증자', '수수료']
const model = buildSearchModel()

console.log(`색인 문서 ${model.docCount}건 기준\n`)
console.log('| 질의 | 결과 건수 | 상위 3건 |')
console.log('|---|---|---|')
for (const q of QUERIES) {
  const hits = model.search(q)
  console.log(`| ${q} | ${hits.length} | ${hits.slice(0, 3).join(', ') || '없음'} |`)
}
