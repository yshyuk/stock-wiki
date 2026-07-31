# stock-wiki 사이트 구축 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 저장소에 쌓인 마크다운 챕터를 VitePress로 빌드해 `stock-wiki.digestive-coffee.blog`에 배포하고, 애드센스 승인 신청이 가능한 상태(정책 페이지·광고 슬롯·SEO 메타)까지 만든다.

**Architecture:** 저장소 루트를 VitePress의 `srcDir`로 쓴다. 콘텐츠 마크다운은 한 글자도 수정하지 않고, 사이트에 필요한 변형(미집필 링크 비활성화, 본문 중간 광고 삽입, 검색 색인에 keywords 주입)은 전부 빌드 시점의 markdown-it 플러그인과 VitePress 훅으로 처리한다. 목차 트리는 확정 목차 데이터와 실제 파일 존재 여부를 대조해 생성한다.

**Tech Stack:** VitePress 1.6.4, mermaid 11 + vitepress-plugin-mermaid 2.0.17, MiniSearch(VitePress 내장 로컬 검색), Node 22, Cloudflare Pages.

---

## Global Constraints

설계 문서 `docs/superpowers/specs/2026-07-30-stock-wiki-site-design.md`에서 확정된 사항. 모든 태스크에 적용된다.

1. **`part1-basics/` ~ `part7-trends/` 안의 마크다운 파일을 수정하지 않는다.** 파트 3 집필이 별도 세션에서 병행되므로 충돌한다. 이 프로젝트의 제1 제약이다. 유일한 예외는 Task 5에서 mermaid 렌더가 실제로 깨진 경우의 다이어그램 문법 수정이다.
2. **`README.md`도 수정하지 않는다.** 깃허브 진입점으로 유지하고 사이트에서는 제외한다.
3. **모든 자체 작성 모듈은 `.js`(순수 JavaScript)로 쓴다.** TypeScript를 쓰지 않는다. `node --test`가 트랜스파일 없이 그대로 import할 수 있어야 테스트에 빌드 단계가 끼지 않는다. `package.json`의 `"type": "module"` 덕분에 `.js`가 그대로 ESM이다. 타입 힌트가 필요하면 JSDoc `/** @type {import('vitepress').UserConfig} */`을 쓴다.
4. **사이트 URL은 `https://stock-wiki.digestive-coffee.blog`** — 상수 한 곳(`.vitepress/lib/site.js`의 `SITE_URL`)에만 두고 모든 곳에서 참조한다.
5. **문의 이메일은 `yshyuk.63@gmail.com`.**
6. **증권사 실명·순위를 쓰지 않는다.** 콘텐츠 집필 규칙이 사이트 부속 페이지(랜딩·정책)에도 그대로 적용된다.
7. **톤은 해요체.** 기존 13개 챕터와 같은 목소리를 유지한다.
8. **`ignoreDeadLinks`는 Task 3 완료 시점부터 `false`로 유지한다.** Task 1에서만 임시로 `true`를 쓰고, Task 3에서 되돌린 뒤 다시 켜지 않는다.
9. **커밋은 각 태스크 끝에서 한 번씩.** 브랜치는 `feat/site`.

---

## 파일 구조

작업 전에 어떤 파일이 무엇을 책임지는지 확정한다. 각 파일은 하나의 책임만 갖는다.

| 파일 | 책임 | 생성 태스크 |
|---|---|---|
| `.nvmrc` | Node 버전 고정 (22) | 1 |
| `.gitignore` | `node_modules`, 빌드 산출물 제외 | 1 |
| `package.json` | 의존성·스크립트 | 1 |
| `.vitepress/config.js` | VitePress 설정 전체. 다른 모듈을 조립만 하고 로직을 담지 않는다 | 1 |
| `.vitepress/lib/site.js` | 사이트 상수 (URL, 제목, 문의 이메일) | 1 |
| `.vitepress/lib/chapters.js` | 확정 목차 데이터 (파트 1~6의 38개 + 파트 7의 계획분) | 2 |
| `.vitepress/lib/sidebar.js` | 목차 데이터 + 파일 존재 여부 → 사이드바 트리 | 2 |
| `.vitepress/lib/planned-links.js` | 미집필 챕터를 가리키는 링크를 비활성 텍스트로 변환 | 3 |
| `.vitepress/lib/search-render.js` | 검색 색인 텍스트에 frontmatter `keywords` 주입 | 4 |
| `.vitepress/lib/mid-content-ad.js` | 본문 중간 광고 슬롯 삽입 | 6 |
| `.vitepress/lib/seo.js` | 페이지별 head 태그·JSON-LD 생성 | 8 |
| `.vitepress/theme/index.js` | 기본 테마 확장, 슬롯 주입, 전역 컴포넌트 등록 | 6 |
| `.vitepress/theme/AdSlot.vue` | 광고 자리. 발행자 ID 없으면 렌더 안 함 | 6 |
| `.vitepress/theme/custom.css` | 「집필 예정」 표시 등 커스텀 스타일 | 6 |
| `index.md` | 랜딩 페이지 | 1(임시) → 7(완성) |
| `about/privacy.md` | 개인정보처리방침 | 7 |
| `about/disclaimer.md` | 면책조항 | 7 |
| `about/contact.md` | 문의 | 7 |
| `public/robots.txt` | 크롤러 지침 | 8 |
| `public/ads.txt` | 애드센스 발행자 선언 (승인 후 채움) | 8 |
| `tests/helpers/search-index.js` | 검색 색인 모형 (테스트·측정 스크립트 공용) | 4 |
| `scripts/measure-search.js` | 합성어 내부 일치 측정 — 판정하지 않고 표만 출력 | 4 |
| `tests/unit/*.test.js` | 빌드 없이 도는 단위 테스트 | 2·3·4·6 |
| `tests/build/*.test.js` | `.vitepress/dist`를 검사하는 산출물 테스트 | 1·8 |

**분리 원칙**: `config.js`는 조립만 한다. 판단 로직(어떤 링크가 죽었는지, 어디에 광고를 넣는지, 어떤 head 태그를 만드는지)은 전부 `lib/` 아래 개별 모듈로 나가고, 각 모듈은 순수 함수로 테스트 가능해야 한다. `config.js`가 커지기 시작하면 로직이 새어 들어온 것이다.

---

### Task 1: 프로젝트 부트스트랩 — 빌드 파이프라인과 내부 문서 격리

VitePress를 세우고 빌드가 도는 상태까지 만든다. 이 태스크의 진짜 산출물은 "빌드가 된다"가 아니라 **"내부 작업 문서가 사이트에 실리지 않는다"**는 보장이다. `srcDir`이 저장소 루트라 `srcExclude`를 빠뜨리면 `handoffs.md`와 `.superpowers/` 작업 로그가 그대로 웹에 공개된다.

**Files:**
- Create: `.nvmrc`, `.gitignore`, `package.json`, `.vitepress/config.js`, `.vitepress/lib/site.js`, `index.md`
- Test: `tests/build/output.test.js`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces:
  - `.vitepress/lib/site.js` → `export const SITE_URL: string`, `export const SITE_TITLE: string`, `export const SITE_DESCRIPTION: string`
  - `npm run build` → `.vitepress/dist/` 생성
  - `npm test` → `node --test "tests/**/*.test.js"`

- [ ] **Step 1: Node 버전을 고정하고 셸에서 잡히게 한다**

nvm에 v22.23.1이 설치되어 있지만 비대화형 셸에서 `node`가 잡히지 않는다. 먼저 `.nvmrc`를 만든다.

```bash
cd ~/Documents/Repository/stock-wiki
echo "22" > .nvmrc
```

이후 모든 npm/node 명령은 아래처럼 nvm을 로드한 뒤 실행한다. (`nvm use`가 `.nvmrc`를 읽는다.)

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use
```

동작 확인:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node -v
```

기대 출력: `v22.x.x`

- [ ] **Step 2: `.gitignore` 생성**

```
node_modules/
.vitepress/dist/
.vitepress/cache/
```

- [ ] **Step 3: `package.json` 생성**

```json
{
  "name": "stock-wiki-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview",
    "test": "node --test \"tests/**/*.test.js\""
  },
  "devDependencies": {
    "vitepress": "1.6.4"
  }
}
```

- [ ] **Step 4: 의존성 설치**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm install
```

기대: `node_modules/` 생성, 에러 없음.

- [ ] **Step 5: 사이트 상수 모듈 생성**

`.vitepress/lib/site.js`:

```js
export const SITE_URL = 'https://stock-wiki.digestive-coffee.blog'
export const SITE_TITLE = '주식·투자 상식 사전'
export const SITE_DESCRIPTION =
  '증권계좌 개설부터 ETF·연금까지, 주식 투자에 필요한 상식을 검색 질문 하나에 하나씩 답하는 온라인 책이에요.'
```

문의 이메일은 여기 두지 않는다. 쓰이는 곳이 `about/contact.md` 하나뿐이고, 마크다운은 이 모듈을 import할 수 없어서 상수로 두면 참조되지 않는 죽은 데이터가 된다.

- [ ] **Step 6: 임시 랜딩 페이지 생성**

Task 7에서 완성한다. 지금은 빌드가 돌기 위한 최소 형태만 만든다.

`index.md`:

```markdown
---
title: 주식·투자 상식 사전
---

# 주식·투자 상식 사전

준비 중이에요.
```

- [ ] **Step 7: VitePress 설정 생성**

`.vitepress/config.js`:

```js
import { defineConfig } from 'vitepress'
import { SITE_TITLE, SITE_DESCRIPTION } from './lib/site.js'

export default defineConfig({
  lang: 'ko-KR',
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  cleanUrls: true,

  // srcDir이 저장소 루트이므로, 제외하지 않으면 내부 작업 문서가 사이트에 실린다.
  srcExclude: [
    'README.md',
    'docs/**',
    '.superpowers/**',
    'node_modules/**'
  ],

  // Task 3에서 planned-links 플러그인을 붙이면서 false로 되돌린다.
  // 지금은 미집필 챕터를 가리키는 링크 14곳 때문에 빌드가 실패한다.
  ignoreDeadLinks: true
})
```

- [ ] **Step 8: 산출물 검사 테스트를 먼저 작성한다**

`tests/build/output.test.js`:

```js
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
```

- [ ] **Step 9: 테스트를 돌려 실패를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm test
```

기대: `빌드 산출물이 존재한다`가 FAIL — "`.vitepress/dist` 가 없습니다".

- [ ] **Step 10: 빌드 실행**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build
```

기대: `build complete` 메시지. 실패하면 에러 메시지를 그대로 읽고 원인을 해결한 뒤 다시 실행한다. 흔한 원인은 `srcExclude` 패턴 누락이다.

- [ ] **Step 11: 테스트를 다시 돌려 통과를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm test
```

기대: 4개 테스트 모두 PASS.

- [ ] **Step 12: 개발 서버로 눈으로 확인**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run dev
```

브라우저에서 `http://localhost:5173/part2-korea-market/2-7-short-selling` 를 열어 본문이 나오는지 확인한다. 확인 후 서버를 종료한다.

- [ ] **Step 13: 커밋**

```bash
git add .nvmrc .gitignore package.json package-lock.json .vitepress/ index.md tests/
git commit -m "feat(site): VitePress 부트스트랩 및 내부 문서 격리

srcDir이 저장소 루트이므로 srcExclude로 README·docs·.superpowers를 제외했다.
빌드 산출물에 내부 작업 문서가 실리지 않는지를 테스트로 고정했다.
ignoreDeadLinks는 Task 3까지만 임시로 true."
```

---

### Task 2: 목차 트리 자동 생성

39개 확정 목차를 데이터로 두고, 실제 파일 존재 여부와 대조해 사이드바를 만든다. 완성된 챕터는 링크, 미집필 챕터는 비활성으로 표시한다.

**Files:**
- Create: `.vitepress/lib/chapters.js`, `.vitepress/lib/sidebar.js`, `tests/unit/sidebar.test.js`
- Modify: `.vitepress/config.js`

**Interfaces:**
- Consumes: `.vitepress/lib/site.js` (없음 — 이 태스크는 site 상수를 쓰지 않는다)
- Produces:
  - `chapters.js` → `export const PARTS: Array<{ part: number, title: string, dir: string }>`, `export const CHAPTERS: Array<{ part: number, order: number, title: string, file: string }>`
    - `file`은 저장소 루트 기준 상대경로 (예: `'part2-korea-market/2-7-short-selling.md'`)
  - `sidebar.js` → `export function buildSidebar({ root, exists, listDir, warn }): Array<{ text: string, collapsed: boolean, items: Array<{ text: string, link?: string }> }>`
    - `root`: 저장소 루트 절대경로
    - `exists`: `(absPath: string) => boolean` — 기본값 `fs.existsSync`
    - `listDir`: `(absPath: string) => string[]` — 기본값은 폴더가 있으면 `fs.readdirSync`, 없으면 `[]`
    - `warn`: `(message: string) => void` — 기본값 `console.warn`. 목차 데이터와 실제 파일이 어긋날 때 호출된다
    - 파일시스템 접근을 전부 주입 가능하게 두는 이유는 테스트가 실제 디스크 상태에 의존하지 않게 하기 위해서다
    - 반환값의 `items[].link`가 없으면 미집필 챕터다

- [ ] **Step 1: 확정 목차 데이터 작성**

`.vitepress/lib/chapters.js`:

```js
export const PARTS = [
  { part: 1, title: '파트 1. 주식 투자, 처음이라면', dir: 'part1-basics' },
  { part: 2, title: '파트 2. 국내 주식시장 이해하기', dir: 'part2-korea-market' },
  { part: 3, title: '파트 3. 미국주식·해외투자', dir: 'part3-us-overseas' },
  { part: 4, title: '파트 4. ETF·펀드·연금으로 하는 투자', dir: 'part4-etf-pension' },
  { part: 5, title: '파트 5. 기업분석·재무제표 입문', dir: 'part5-analysis' },
  { part: 6, title: '파트 6. 알아두면 돈이 되는 투자 상식', dir: 'part6-common-sense' },
  { part: 7, title: '파트 7. 투자 트렌드', dir: 'part7-trends' }
]

export const CHAPTERS = [
  { part: 1, order: 1, title: '주식이란 무엇인가', file: 'part1-basics/1-1-what-is-stock.md' },
  { part: 1, order: 2, title: '증권계좌 개설, 어디서 어떻게 하나', file: 'part1-basics/1-2-open-brokerage-account.md' },
  { part: 1, order: 3, title: '주식 사는 법 — 호가창과 주문', file: 'part1-basics/1-3-how-to-buy-stocks.md' },
  { part: 1, order: 4, title: '매매 시간과 장전·장후 거래', file: 'part1-basics/1-4-trading-hours.md' },
  { part: 1, order: 5, title: '수수료와 세금', file: 'part1-basics/1-5-fees-and-taxes.md' },
  { part: 1, order: 6, title: '시가총액·주가·거래량 읽는 법', file: 'part1-basics/1-6-market-cap-price-volume.md' },

  { part: 2, order: 1, title: '코스피 vs 코스닥', file: 'part2-korea-market/2-1-kospi-vs-kosdaq.md' },
  { part: 2, order: 2, title: '코스피 지수는 어떻게 계산되나', file: 'part2-korea-market/2-2-how-kospi-index-works.md' },
  { part: 2, order: 3, title: '배당이란', file: 'part2-korea-market/2-3-dividend-basics.md' },
  { part: 2, order: 4, title: '공모주 청약', file: 'part2-korea-market/2-4-ipo-subscription.md' },
  { part: 2, order: 5, title: '유상증자·무상증자·액면분할', file: 'part2-korea-market/2-5-capital-increase-and-split.md' },
  { part: 2, order: 6, title: '상한가·하한가·서킷브레이커', file: 'part2-korea-market/2-6-price-limit-circuit-breaker.md' },
  { part: 2, order: 7, title: '공매도란 무엇이고 왜 논란인가', file: 'part2-korea-market/2-7-short-selling.md' },

  { part: 3, order: 1, title: '미국주식, 왜 하는가', file: 'part3-us-overseas/3-1-why-us-stocks.md' },
  { part: 3, order: 2, title: '미국주식 거래 시간과 프리마켓·애프터마켓', file: 'part3-us-overseas/3-2-us-trading-hours.md' },
  { part: 3, order: 3, title: '미국주식 세금', file: 'part3-us-overseas/3-3-us-stock-tax.md' },
  { part: 3, order: 4, title: '환율과 환전 — 환헤지 vs 환노출', file: 'part3-us-overseas/3-4-exchange-rate.md' },
  { part: 3, order: 5, title: 'S&P500·나스닥·다우', file: 'part3-us-overseas/3-5-us-indices.md' },
  { part: 3, order: 6, title: '미국 배당주와 배당 성장 투자', file: 'part3-us-overseas/3-6-us-dividend-investing.md' },

  { part: 4, order: 1, title: 'ETF란 무엇인가', file: 'part4-etf-pension/4-1-what-is-etf.md' },
  { part: 4, order: 2, title: '인덱스 투자', file: 'part4-etf-pension/4-2-index-investing.md' },
  { part: 4, order: 3, title: 'ETF 고르는 법', file: 'part4-etf-pension/4-3-how-to-choose-etf.md' },
  { part: 4, order: 4, title: '연금저축펀드 vs IRP', file: 'part4-etf-pension/4-4-pension-fund-vs-irp.md' },
  { part: 4, order: 5, title: 'ISA 계좌', file: 'part4-etf-pension/4-5-isa-account.md' },
  { part: 4, order: 6, title: '절세 계좌 3종 우선순위', file: 'part4-etf-pension/4-6-tax-account-priority.md' },

  { part: 5, order: 1, title: '재무제표 보는 법 (DART 사용법)', file: 'part5-analysis/5-1-how-to-read-dart.md' },
  { part: 5, order: 2, title: 'PER — 이 주식은 비싼가 싼가', file: 'part5-analysis/5-2-per.md' },
  { part: 5, order: 3, title: 'PBR과 ROE', file: 'part5-analysis/5-3-pbr-roe.md' },
  { part: 5, order: 4, title: '손익계산서 읽기', file: 'part5-analysis/5-4-income-statement.md' },
  { part: 5, order: 5, title: '부채비율과 유동비율', file: 'part5-analysis/5-5-debt-ratio.md' },
  { part: 5, order: 6, title: '가치평가의 한계', file: 'part5-analysis/5-6-limits-of-valuation.md' },

  { part: 6, order: 1, title: '금리와 주가의 관계', file: 'part6-common-sense/6-1-interest-rate-and-stocks.md' },
  { part: 6, order: 2, title: '인플레이션과 투자', file: 'part6-common-sense/6-2-inflation.md' },
  { part: 6, order: 3, title: '분산투자와 포트폴리오', file: 'part6-common-sense/6-3-diversification.md' },
  { part: 6, order: 4, title: '투자 심리', file: 'part6-common-sense/6-4-investor-psychology.md' },
  { part: 6, order: 5, title: '복리의 힘', file: 'part6-common-sense/6-5-compound-interest.md' },
  { part: 6, order: 6, title: '경제 뉴스 읽는 법', file: 'part6-common-sense/6-6-reading-economic-news.md' },
  { part: 6, order: 7, title: '흔한 투자 사기 유형과 피하는 법', file: 'part6-common-sense/6-7-investment-scams.md' },

  { part: 7, order: 1, title: '2026년 하반기 시장 트렌드 총정리', file: 'part7-trends/2026-h2-market-trends.md' }
]
```

사이드바에 쓰는 제목은 README의 긴 제목을 줄인 것이다. 사이드바 폭에 맞추기 위해서이며, 페이지 안의 `<h1>`과 `<title>`은 각 챕터 frontmatter의 `title`을 그대로 쓴다(변경하지 않는다).

- [ ] **Step 2: 실패하는 테스트를 먼저 작성한다**

`tests/unit/sidebar.test.js`:

```js
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

test('39개 챕터가 전부 표시된다', () => {
  const sidebar = buildSidebar({ root: ROOT, exists, listDir: () => [] })
  const total = sidebar.reduce((n, group) => n + group.items.length, 0)
  assert.equal(total, 39)
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
```

- [ ] **Step 3: 테스트를 돌려 실패를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test "tests/unit/**/*.test.js"
```

기대: FAIL — `Cannot find module '.../.vitepress/lib/sidebar.js'`

- [ ] **Step 4: 사이드바 생성기 구현**

`.vitepress/lib/sidebar.js`:

```js
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
```

- [ ] **Step 5: 테스트를 돌려 전부 통과하는지 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test "tests/unit/**/*.test.js"
```

기대: 8개 테스트 모두 PASS.

- [ ] **Step 6: 설정에 사이드바를 연결한다**

`.vitepress/config.js`에 아래를 추가한다. import를 파일 상단에, `themeConfig`를 `ignoreDeadLinks` 앞에 넣는다.

```js
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { buildSidebar } from './lib/sidebar.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
```

```js
  themeConfig: {
    sidebar: buildSidebar({ root: ROOT }),
    outline: { level: [2, 3], label: '이 페이지' },
    docFooter: { prev: '이전', next: '다음' },
    darkModeSwitchLabel: '다크 모드',
    returnToTopLabel: '맨 위로',
    sidebarMenuLabel: '목차'
  },
```

- [ ] **Step 7: 빌드하고 눈으로 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build && npm run dev
```

브라우저에서 확인할 것:
- 왼쪽 사이드바에 파트 1~7이 모두 있다
- 파트 1·2는 펼쳐져 있고 각 챕터가 링크다
- 파트 3~7은 접혀 있고, 펼치면 제목만 있고 클릭이 안 된다
- 오른쪽에 「이 페이지」 아웃라인이 나온다 (3단 레이아웃)

확인 후 서버를 종료한다.

- [ ] **Step 8: 커밋**

```bash
git add .vitepress/lib/chapters.js .vitepress/lib/sidebar.js .vitepress/config.js tests/unit/sidebar.test.js
git commit -m "feat(site): 목차 트리 자동 생성

확정 목차 39개를 데이터로 두고 파일 존재 여부와 대조해 사이드바를 만든다.
미집필 26개는 제목만 비활성으로 표시하고, 파일이 생기면 자동 활성화된다.
파트 7은 목차 고정이 아니므로 폴더의 추가 파일도 뒤에 붙인다."
```

---

### Task 3: 미집필 챕터 링크 비활성화

본문에는 아직 없는 챕터를 가리키는 상대링크가 14곳 있다. 마크다운을 수정하지 않고 빌드 시점에 비활성 텍스트로 바꾼다. 이 태스크가 끝나면 `ignoreDeadLinks`를 끌 수 있고, 그때부터 진짜 오타 링크는 빌드를 실패시킨다.

**Files:**
- Create: `.vitepress/lib/planned-links.js`, `tests/unit/planned-links.test.js`
- Modify: `.vitepress/config.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `planned-links.js` → `export function plannedLinks(md, { root, exists }): void` — markdown-it 플러그인. `md.use(plannedLinks, { root, exists })` 형태로 쓴다.
    - `root`: 저장소 루트 절대경로
    - `exists`: `(absPath: string) => boolean`
    - 대상 판정: `href`가 `/`나 스킴으로 시작하지 않고 `.md`로 끝나는(앵커 허용) 상대링크
    - 대상 파일이 없으면 `<a>`를 `<span class="planned-link">`로 바꾸고 `data-planned` 속성을 붙인다

- [ ] **Step 1: 실패하는 테스트를 먼저 작성한다**

`tests/unit/planned-links.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { plannedLinks } from '../../.vitepress/lib/planned-links.js'

const ROOT = '/repo'
const written = new Set([
  '/repo/part1-basics/1-3-how-to-buy-stocks.md',
  '/repo/part2-korea-market/2-4-ipo-subscription.md'
])

function render(src, relativePath) {
  const md = new MarkdownIt()
  md.use(plannedLinks, { root: ROOT, exists: (p) => written.has(p) })
  return md.render(src, { relativePath })
}

test('집필된 챕터 링크는 그대로 둔다', () => {
  const html = render(
    '[1-3](../part1-basics/1-3-how-to-buy-stocks.md)에서 다뤄요.',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="\.\.\/part1-basics\/1-3-how-to-buy-stocks\.md">1-3<\/a>/)
})

test('같은 폴더의 집필된 챕터 링크도 그대로 둔다', () => {
  const html = render(
    '[2-4](2-4-ipo-subscription.md) 참고',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="2-4-ipo-subscription\.md">2-4<\/a>/)
})

test('미집필 챕터 링크는 span으로 바뀐다', () => {
  const html = render(
    '[3-3](../part3-us-overseas/3-3-us-stock-tax.md)에서 다뤄요.',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.doesNotMatch(html, /<a /)
  assert.match(html, /<span class="planned-link" data-planned>3-3<\/span>/)
})

test('앵커가 붙은 미집필 링크도 처리한다', () => {
  const html = render(
    '[세금](../part3-us-overseas/3-3-us-stock-tax.md#핵심-답변)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<span class="planned-link" data-planned>세금<\/span>/)
})

test('외부 링크는 건드리지 않는다', () => {
  const html = render(
    '[KRX](https://regulation.krx.co.kr/contents/RGL/03/index.md)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="https:\/\/regulation\.krx\.co\.kr/)
})

test('.md가 아닌 링크는 건드리지 않는다', () => {
  const html = render(
    '[이미지](images/chart.png)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<a href="images\/chart\.png">/)
})

test('링크 안의 강조 표시는 보존된다', () => {
  const html = render(
    '[**3-3**](../part3-us-overseas/3-3-us-stock-tax.md)',
    'part2-korea-market/2-7-short-selling.md'
  )
  assert.match(html, /<span class="planned-link" data-planned><strong>3-3<\/strong><\/span>/)
})
```

- [ ] **Step 2: markdown-it을 직접 의존성에 추가한다**

VitePress가 내부적으로 쓰지만 테스트에서 직접 import하므로 명시한다.

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm install -D markdown-it
```

- [ ] **Step 3: 테스트를 돌려 실패를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/planned-links.test.js
```

기대: FAIL — `Cannot find module '.../.vitepress/lib/planned-links.js'`

- [ ] **Step 4: 플러그인 구현**

`.vitepress/lib/planned-links.js`:

```js
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** 상대경로 .md 링크인지 판정한다. 절대경로·외부 URL·다른 확장자는 제외. */
function isRelativeMarkdownLink(href) {
  if (!href) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false // http:, https:, mailto: 등
  if (href.startsWith('/') || href.startsWith('#')) return false
  return /\.md(#.*)?$/.test(href)
}

/**
 * markdown-it 플러그인.
 * 렌더 시점이 아니라 core 체인에서 토큰을 바꾼다. VitePress가 자체 링크 플러그인으로
 * href를 라우트 경로로 재작성하기 전에 원본 href를 봐야 하기 때문이다.
 *
 * @param {import('markdown-it')} md
 * @param {{ root: string, exists?: (absPath: string) => boolean }} opts
 */
export function plannedLinks(md, { root, exists = existsSync }) {
  md.core.ruler.push('planned_links', (state) => {
    const relativePath = state.env?.relativePath
    if (!relativePath) return

    const pageDir = dirname(join(root, relativePath))

    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue

      let insidePlanned = false
      for (const token of blockToken.children) {
        if (token.type === 'link_open') {
          const href = token.attrGet('href')
          if (!isRelativeMarkdownLink(href)) continue

          const target = resolve(pageDir, href.replace(/#.*$/, ''))
          if (exists(target)) continue

          token.type = 'html_inline'
          token.tag = ''
          token.attrs = null
          token.content = '<span class="planned-link" data-planned>'
          insidePlanned = true
          continue
        }

        if (token.type === 'link_close' && insidePlanned) {
          token.type = 'html_inline'
          token.tag = ''
          token.attrs = null
          token.content = '</span>'
          insidePlanned = false
        }
      }
    }
  })
}
```

- [ ] **Step 5: 테스트를 돌려 통과를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/planned-links.test.js
```

기대: 7개 테스트 모두 PASS.

링크가 중첩될 수 없다는 CommonMark 규칙 덕분에 `insidePlanned` 불리언 하나로 충분하다.

- [ ] **Step 6: 설정에 플러그인을 연결하고 `ignoreDeadLinks`를 끈다**

`.vitepress/config.js`에 import를 추가한다.

```js
import { plannedLinks } from './lib/planned-links.js'
```

`ignoreDeadLinks: true` 줄과 그 위의 주석 두 줄을 삭제하고, 그 자리에 아래를 넣는다.

```js
  // 계획된 미집필 챕터 링크는 plannedLinks가 처리한다.
  // 여기 걸리는 건 진짜 오타 링크이므로 빌드를 세운다.
  ignoreDeadLinks: false,

  markdown: {
    config(md) {
      md.use(plannedLinks, { root: ROOT })
    }
  },
```

- [ ] **Step 7: 빌드해서 깨진 링크 없이 통과하는지 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build
```

기대: `build complete`. 데드링크 에러가 뜨면 그 링크는 계획된 미집필 챕터가 아니라 **진짜 오타**다. 어떤 파일의 어떤 링크인지 보고하고 판단을 받는다. 마크다운을 임의로 고치지 않는다(제1 제약).

- [ ] **Step 8: 실제 산출물에서 확인한다**

```bash
grep -o 'class="planned-link"' .vitepress/dist/part*/*.html | sort | uniq -c
grep -o 'class="planned-link"' .vitepress/dist/part*/*.html | wc -l
```

기대: 합계 14. 설계 문서 6장이 집계한 미집필 링크 수와 일치해야 한다.

- **14보다 적으면** 판정 조건(`isRelativeMarkdownLink`)이 일부 링크를 놓친 것이다. 어떤 링크가 빠졌는지 찾는다.
- **14보다 많으면** 먼저 파일별 분포를 본다. VitePress가 SSR 결과와 하이드레이션 페이로드에 같은 마크업을 중복으로 내보내 배수로 잡히는 경우가 있다. 파일별 개수가 원본 링크 수의 정수배면 중복 계상이므로 문제가 아니다. 배수가 아니면 링크가 아닌 곳에 표시가 붙은 것이므로 원인을 찾는다.

원본 링크 수는 아래로 확인한다.

```bash
grep -ohE '\]\(\.\./part[3-7][^)]*\.md[^)]*\)|\]\(part[3-7][^)]*\.md[^)]*\)' part1-basics/*.md part2-korea-market/*.md | wc -l
```

- [ ] **Step 9: 커밋**

```bash
git add .vitepress/lib/planned-links.js .vitepress/config.js tests/unit/planned-links.test.js package.json package-lock.json
git commit -m "feat(site): 미집필 챕터 링크 비활성화 및 데드링크 검사 활성화

본문에 있는 미집필 챕터 링크 14곳을 빌드 시점에 span으로 바꾼다.
마크다운은 수정하지 않으며, 파트 3을 집필하면 링크가 자동으로 살아난다.
스텁 페이지를 만들지 않는 이유는 얇은 페이지 색인이 애드센스 심사에
불리하기 때문이다. ignoreDeadLinks를 false로 되돌려 오타 링크는 빌드를 세운다."
```

---

### Task 4: 검색 — keywords 색인 주입과 실측

설계 7.2에 따라 커스텀 색인 토크나이저는 넣지 않는다. 대신 지금까지 검색에 전혀 쓰이지 않던 frontmatter `keywords`를 색인에 넣고, 실제로 어떤 질의가 새는지 **측정해서 기록**한다.

**Files:**
- Create: `.vitepress/lib/search-render.js`, `tests/helpers/search-index.js`, `tests/unit/search-render.test.js`, `tests/unit/search-recall.test.js`, `scripts/measure-search.js`
- Modify: `.vitepress/config.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `search-render.js` → `export function injectKeywords(html, keywords): string` — 순수 문자열 변환. 첫 `</h1>` 뒤에 keywords 문단을 넣고, `<h1>`이 없으면 맨 앞에 넣는다.
  - `search-render.js` → `export function renderForSearch(src, env, md): string` — VitePress `search.options._render`에 그대로 넘길 함수
  - `tests/helpers/search-index.js` → `export function buildSearchModel(): { docCount: number, search: (q: string) => string[] }`, `export const SEARCH_OPTIONS`

- [ ] **Step 1: 주입 함수의 실패하는 테스트를 작성한다**

`tests/unit/search-render.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { injectKeywords } from '../../.vitepress/lib/search-render.js'

test('첫 h1 뒤에 keywords 문단을 넣는다', () => {
  const html = '<h1>공매도란</h1>\n<p>본문</p>'
  const out = injectKeywords(html, ['공매도란', '공매도 뜻'])
  assert.equal(
    out,
    '<h1>공매도란</h1>\n<p class="search-keywords">공매도란 공매도 뜻</p>\n<p>본문</p>'
  )
})

test('h1이 없으면 맨 앞에 넣는다', () => {
  const out = injectKeywords('<p>본문</p>', ['ETF'])
  assert.equal(out, '<p class="search-keywords">ETF</p>\n<p>본문</p>')
})

test('keywords가 없으면 원본을 그대로 돌려준다', () => {
  const html = '<h1>제목</h1>'
  assert.equal(injectKeywords(html, []), html)
  assert.equal(injectKeywords(html, undefined), html)
})

test('두 번째 h1이 있어도 첫 번째에만 넣는다', () => {
  const out = injectKeywords('<h1>A</h1><h1>B</h1>', ['키워드'])
  assert.equal(out, '<h1>A</h1>\n<p class="search-keywords">키워드</p>\n<h1>B</h1>')
})

test('HTML 특수문자가 든 keywords를 이스케이프한다', () => {
  const out = injectKeywords('<h1>A</h1>', ['S&P500 <지수>'])
  assert.match(out, /S&amp;P500 &lt;지수&gt;/)
})
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/search-render.test.js
```

기대: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

`.vitepress/lib/search-render.js`:

```js
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 검색 색인용 HTML에 frontmatter keywords를 끼워 넣는다.
 * VitePress는 title / titles / text 만 색인하므로 keywords가 그냥 버려지고 있다.
 * 첫 h1 뒤에 넣는 이유는 VitePress가 heading 단위로 색인 문서를 쪼개기 때문이다.
 * 맨 앞에 넣으면 제목 없는 섹션이 생겨 검색 결과에 빈 항목이 뜬다.
 */
export function injectKeywords(html, keywords) {
  if (!keywords || keywords.length === 0) return html
  const block = `<p class="search-keywords">${escapeHtml(keywords.join(' '))}</p>`
  if (/<\/h1>/.test(html)) {
    // 원본에 </h1> 뒤 개행이 있든 없든 block 뒤에는 정확히 하나의 개행만 남긴다.
    return html.replace(/<\/h1>\n?/, `</h1>\n${block}\n`)
  }
  return `${block}\n${html}`
}

/**
 * VitePress `search.options._render`에 그대로 넘긴다.
 * @param {string} src 마크다운 원문
 * @param {{ frontmatter?: Record<string, unknown> }} env
 * @param {{ render: (src: string, env: unknown) => string }} md
 */
export function renderForSearch(src, env, md) {
  const html = md.render(src, env)
  return injectKeywords(html, env?.frontmatter?.keywords)
}
```

- [ ] **Step 4: 테스트를 돌려 통과를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/search-render.test.js
```

기대: 5개 테스트 모두 PASS.

- [ ] **Step 5: 설정에 검색을 연결한다**

`.vitepress/config.js`에 import를 추가한다.

```js
import { renderForSearch } from './lib/search-render.js'
```

`themeConfig` 안에 아래를 추가한다.

```js
    search: {
      provider: 'local',
      options: {
        _render: renderForSearch,
        translations: {
          button: { buttonText: '검색', buttonAriaLabel: '검색' },
          modal: {
            displayDetails: '상세 보기',
            resetButtonTitle: '검색어 지우기',
            backButtonTitle: '닫기',
            noResultsText: '검색 결과가 없어요',
            footer: {
              selectText: '선택',
              navigateText: '이동',
              closeText: '닫기'
            }
          }
        }
      }
    },
```

색인·질의 옵션은 건드리지 않는다. VitePress 기본값 `{ fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }`이 조사 문제를 이미 해결한다(설계 7.0).

- [ ] **Step 6: 색인 모형 헬퍼를 만든다**

VitePress가 만드는 인덱스 자체가 아니라, **같은 필드 구성과 같은 검색 옵션을 쓴 MiniSearch 인덱스**를 실제 챕터 본문으로 만든다. 토큰화와 접두어 매칭 동작을 확인하는 것이 목적이며, 최종 확인은 Step 9의 브라우저 검증이다.

테스트(Step 7)와 측정 스크립트(Step 8)가 둘 다 쓰므로 헬퍼로 분리한다.

`tests/helpers/search-index.js`:

```js
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
```

- [ ] **Step 7: 조사 부착 케이스 테스트를 작성한다**

`tests/unit/search-recall.test.js`:

```js
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
```

- [ ] **Step 8: 측정 스크립트를 만들고 돌린다**

합성어 내부 일치는 **판정 대상이 아니라 측정 대상**이다(설계 7.4). 통과·실패가 없으므로 테스트가 아니라 스크립트로 만든다.

`scripts/measure-search.js`:

```js
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
```

`package.json`의 `scripts`에 추가한다.

```json
    "measure:search": "node scripts/measure-search.js"
```

minisearch를 설치하고 테스트와 측정을 차례로 돌린다.

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm install -D minisearch \
  && node --test tests/unit/search-recall.test.js \
  && npm run measure:search
```

기대: 테스트 5개 PASS. 측정 스크립트가 마크다운 표를 출력한다.

**조사 케이스가 하나라도 실패하면** 설계 7.0의 전제가 틀린 것이다. 임의로 토크나이저를 넣지 말고 실패한 질의와 실제 상위 결과를 보고한 뒤 판단을 받는다.

- [ ] **Step 9: 브라우저에서 실제 검색을 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build && npm run preview
```

검색창에서 확인할 것:
- `공매도` → 2-7이 나온다
- `공매도 재개` → 두 단어 질의에서도 2-7이 나온다
- `배당락` → 2-3이 나온다
- 결과 클릭 시 해당 챕터로 이동한다
- UI 문구가 한국어로 나온다

확인 후 서버를 종료한다.

- [ ] **Step 10: 측정 결과를 계획서에 기록한다**

Step 8의 합성어 측정 결과를 이 파일 맨 아래 「검색 재현율 측정 결과」 절에 적는다. Task 10에서 `handoffs.md`로 옮긴다.

- [ ] **Step 11: 커밋**

```bash
git add .vitepress/lib/search-render.js .vitepress/config.js tests/helpers/search-index.js tests/unit/search-render.test.js tests/unit/search-recall.test.js scripts/measure-search.js package.json package-lock.json docs/superpowers/plans/2026-07-31-stock-wiki-site.md
git commit -m "feat(site): 검색 색인에 frontmatter keywords 주입 및 재현율 측정

VitePress는 title/titles/text만 색인해서 챕터마다 적어둔 실제 검색어가
버려지고 있었다. _render로 첫 h1 뒤에 주입한다.

커스텀 색인 토크나이저는 넣지 않는다. 기본 searchOptions의 prefix:true가
조사 문제를 이미 해결하기 때문이다(설계 7.0). 합성어 내부 일치는
접미사 색인이 필요한 영역이라 측정 결과만 기록하고 판단을 남긴다."
```

---

### Task 5: mermaid 렌더링

`handoffs.md` 8장이 이 프로젝트로 넘긴 숙제다. 1-1·1-2·2-4·2-7의 mermaid 다이어그램 4건은 지금까지 정적 문법 검사만 거쳤고 **실제 렌더를 확인한 사람이 없다.**

**Files:**
- Modify: `.vitepress/config.js`, `package.json`

**Interfaces:**
- Consumes: Task 1~4에서 만든 `config.js`의 설정 객체
- Produces: 없음 (설정 변경만)

- [ ] **Step 1: 의존성 설치**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm install -D mermaid vitepress-plugin-mermaid
```

기대 버전: `mermaid@11.x`, `vitepress-plugin-mermaid@2.0.17`. `vitepress-plugin-mermaid`의 peer는 `mermaid 10 || 11`, `vitepress ^1.0.0`이므로 현재 조합과 맞는다.

- [ ] **Step 2: 다이어그램이 있는 파일과 개수를 먼저 확인한다**

```bash
grep -c '```mermaid' part1-basics/*.md part2-korea-market/*.md | grep -v ':0'
```

기대 출력:

```
part1-basics/1-1-what-is-stock.md:1
part1-basics/1-2-open-brokerage-account.md:1
part2-korea-market/2-4-ipo-subscription.md:1
part2-korea-market/2-7-short-selling.md:1
```

개수가 다르면 handoffs의 집계와 어긋난 것이므로 실제 값을 기록해 둔다.

- [ ] **Step 3: `withMermaid`로 설정을 감싼다**

`.vitepress/config.js`에서 import를 바꾼다.

```js
import { withMermaid } from 'vitepress-plugin-mermaid'
```

`export default defineConfig({` 를 `export default withMermaid(defineConfig({` 로 바꾸고, 파일 맨 끝의 `})` 를 `}))` 로 바꾼다.

다크 모드는 플러그인이 body의 `dark` 클래스를 감지해 자동 전환하므로 별도 설정이 필요 없다.

- [ ] **Step 4: 빌드**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build
```

기대: `build complete`. 빌드 단계에서 mermaid 문법 오류가 나면 어느 파일인지 그대로 보고한다.

- [ ] **Step 5: 네 개 다이어그램을 브라우저에서 실제로 확인한다**

이 단계가 handoffs 8장 숙제의 본체다. 자동화하지 않는다 — 렌더는 클라이언트에서 일어나므로 산출물 HTML을 grep해도 확인되지 않는다.

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run preview
```

네 페이지를 순서대로 열어 다이어그램이 **그림으로** 나오는지 확인한다. 코드 블록이 그대로 보이거나 빈칸이면 실패다.

- `/part1-basics/1-1-what-is-stock`
- `/part1-basics/1-2-open-brokerage-account`
- `/part2-korea-market/2-4-ipo-subscription`
- `/part2-korea-market/2-7-short-selling`

각 페이지에서 확인할 것:
1. 다이어그램이 그림으로 렌더된다
2. 라벨의 한글이 깨지지 않는다
3. 다크 모드 토글 시 다이어그램도 따라 바뀐다
4. 모바일 폭(개발자 도구 375px)에서 잘리지 않고 가로 스크롤이 생긴다

**렌더가 깨진 경우에만** 해당 마크다운의 mermaid 블록을 수정한다. 이것이 제1 제약의 유일한 예외다. 수정했다면 무엇을 왜 고쳤는지 커밋 메시지에 남긴다.

- [ ] **Step 6: 결과를 기록한다**

네 건 각각에 대해 아래 표를 채워 이 계획서 맨 아래 「mermaid 렌더 검증 결과」 절에 적는다. Task 10에서 `handoffs.md`로 옮긴다.

| 파일 | 렌더 | 한글 | 다크모드 | 모바일 | 수정 여부 |
|---|---|---|---|---|---|
| 1-1 | | | | | |
| 1-2 | | | | | |
| 2-4 | | | | | |
| 2-7 | | | | | |

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json .vitepress/config.js docs/superpowers/plans/2026-07-31-stock-wiki-site.md
git commit -m "feat(site): mermaid 렌더링 지원 및 다이어그램 4건 실제 렌더 검증

handoffs 8장이 넘긴 숙제를 해결했다. 1-1, 1-2, 2-4, 2-7의 다이어그램은
지금까지 정적 문법 검사만 거쳤고 실제 렌더를 확인한 적이 없었다.
검증 결과를 계획서에 기록했다."
```

---

### Task 6: 3단 레이아웃 · 광고 슬롯

기본 테마를 확장해 광고 자리를 만든다. 발행자 ID가 없으면 아무것도 렌더하지 않으므로, 애드센스 승인 전에도 그대로 배포할 수 있다.

**Files:**
- Create: `.vitepress/theme/index.js`, `.vitepress/theme/AdSlot.vue`, `.vitepress/theme/custom.css`, `.vitepress/lib/mid-content-ad.js`, `tests/unit/mid-content-ad.test.js`
- Modify: `.vitepress/config.js`, `.vitepress/lib/site.js`

**Interfaces:**
- Consumes: `.vitepress/lib/site.js`
- Produces:
  - `site.js` → `export const ADSENSE_CLIENT: string` — 빈 문자열이면 광고를 렌더하지 않는다
  - `mid-content-ad.js` → `export function midContentAd(md, { minSections = 4, beforeSection = 3 }): void` — markdown-it 플러그인. `##` 개수가 `minSections` 이상인 문서의 `beforeSection`번째 `##` 앞에 `<AdSlot position="mid" />`를 삽입한다
  - `AdSlot.vue` → props `{ position: 'top' | 'mid' | 'bottom' }`

- [ ] **Step 1: 광고 상수를 추가한다**

`.vitepress/lib/site.js` 맨 아래에 추가한다.

```js
// 애드센스 승인 후 'ca-pub-XXXXXXXXXXXXXXXX' 를 채운다.
// 빈 문자열인 동안 AdSlot은 아무것도 렌더하지 않는다.
export const ADSENSE_CLIENT = ''
```

- [ ] **Step 2: 본문 중간 광고 삽입기의 실패하는 테스트를 작성한다**

`tests/unit/mid-content-ad.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { midContentAd } from '../../.vitepress/lib/mid-content-ad.js'

function render(src) {
  const md = new MarkdownIt({ html: true })
  md.use(midContentAd, { minSections: 4, beforeSection: 3 })
  return md.render(src)
}

const withSections = (n) =>
  Array.from({ length: n }, (_, i) => `## 섹션 ${i + 1}\n\n본문 ${i + 1}\n`).join('\n')

test('섹션이 4개면 3번째 앞에 광고가 들어간다', () => {
  const html = render(withSections(4))
  const adIndex = html.indexOf('<AdSlot position="mid" />')
  const third = html.indexOf('섹션 3')
  const second = html.indexOf('섹션 2')
  assert.ok(adIndex > 0, '광고 슬롯이 삽입되지 않았습니다')
  assert.ok(adIndex > second && adIndex < third, '3번째 섹션 앞이 아닙니다')
})

test('섹션이 3개면 광고를 넣지 않는다', () => {
  assert.doesNotMatch(render(withSections(3)), /AdSlot/)
})

test('섹션이 6개여도 광고는 하나만 넣는다', () => {
  const html = render(withSections(6))
  assert.equal(html.split('<AdSlot position="mid" />').length - 1, 1)
})

test('h3는 세지 않는다', () => {
  const src = '## A\n\n### a1\n\n### a2\n\n## B\n\n### b1\n'
  assert.doesNotMatch(render(src), /AdSlot/)
})

test('h1은 세지 않는다', () => {
  const src = '# 제목\n\n## A\n\n## B\n\n## C\n'
  assert.doesNotMatch(render(src), /AdSlot/)
})
```

- [ ] **Step 3: 테스트를 돌려 실패를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/mid-content-ad.test.js
```

기대: FAIL — 모듈 없음.

- [ ] **Step 4: 구현**

`.vitepress/lib/mid-content-ad.js`:

```js
/**
 * 본문 중간에 광고 슬롯을 넣는 markdown-it 플러그인.
 * 챕터가 70~130줄로 짧아서 상단·중간·하단 3개를 다 넣으면 본문 대비 광고가 과하다.
 * 섹션이 충분히 많은 문서에만 중간 광고를 넣는다.
 *
 * @param {import('markdown-it')} md
 * @param {{ minSections?: number, beforeSection?: number }} opts
 */
export function midContentAd(md, { minSections = 4, beforeSection = 3 } = {}) {
  md.core.ruler.push('mid_content_ad', (state) => {
    const h2Indexes = []
    state.tokens.forEach((token, i) => {
      if (token.type === 'heading_open' && token.tag === 'h2') h2Indexes.push(i)
    })

    if (h2Indexes.length < minSections) return

    const target = h2Indexes[beforeSection - 1]
    if (target === undefined) return

    const adToken = new state.Token('html_block', '', 0)
    adToken.content = '<AdSlot position="mid" />\n'
    adToken.block = true
    state.tokens.splice(target, 0, adToken)
  })
}
```

- [ ] **Step 5: 테스트를 돌려 통과를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/mid-content-ad.test.js
```

기대: 5개 테스트 모두 PASS.

- [ ] **Step 6: 광고 컴포넌트를 만든다**

`.vitepress/theme/AdSlot.vue`:

```vue
<script setup>
import { onMounted, ref } from 'vue'
import { ADSENSE_CLIENT } from '../lib/site.js'

defineProps({
  position: { type: String, default: 'top' }
})

const enabled = ref(Boolean(ADSENSE_CLIENT))

onMounted(() => {
  if (!enabled.value) return
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    // 광고 로드 실패가 페이지를 깨뜨리지 않게 한다.
  }
})
</script>

<template>
  <div v-if="enabled" class="ad-slot" :class="`ad-slot--${position}`">
    <ins
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="ADSENSE_CLIENT"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </div>
</template>

<style scoped>
.ad-slot {
  margin: 2rem 0;
  min-height: 1px;
}
</style>
```

- [ ] **Step 7: 커스텀 스타일을 만든다**

`.vitepress/theme/custom.css`:

```css
/* 미집필 챕터 링크 — planned-links 플러그인이 만드는 표시 */
.planned-link {
  color: var(--vp-c-text-3);
  cursor: not-allowed;
  border-bottom: 1px dotted var(--vp-c-divider);
}

.planned-link::after {
  content: ' (집필 예정)';
  font-size: 0.85em;
  color: var(--vp-c-text-3);
}

/* 검색 색인용으로만 주입한 keywords 문단은 화면에 보이지 않게 한다.
   _render는 검색 인덱스에만 쓰이므로 실제로는 페이지에 나타나지 않지만,
   방어적으로 숨겨 둔다. */
.search-keywords {
  display: none;
}

/* mermaid 다이어그램이 좁은 화면에서 잘리지 않게 한다 */
.vp-doc .mermaid {
  overflow-x: auto;
}
```

- [ ] **Step 8: 테마를 확장한다**

`.vitepress/theme/index.js`:

```js
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import AdSlot from './AdSlot.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(AdSlot, { position: 'top' }),
      'doc-after': () => h(AdSlot, { position: 'bottom' })
    })
  },
  enhanceApp({ app }) {
    // 마크다운 본문에 midContentAd가 삽입하는 <AdSlot />을 위해 전역 등록한다.
    app.component('AdSlot', AdSlot)
  }
}
```

- [ ] **Step 9: 설정에 중간 광고 플러그인을 연결한다**

`.vitepress/config.js`에 import를 추가한다.

```js
import { midContentAd } from './lib/mid-content-ad.js'
```

`markdown.config`를 아래로 바꾼다.

```js
  markdown: {
    config(md) {
      md.use(plannedLinks, { root: ROOT })
      md.use(midContentAd, { minSections: 4, beforeSection: 3 })
    }
  },
```

- [ ] **Step 10: 애드센스 로더 스크립트를 조건부로 넣는다**

`AdSlot.vue`의 `adsbygoogle.push({})`는 구글 로더 스크립트가 페이지에 있어야 동작한다. 이게 없으면 발행자 ID를 채워도 광고가 나오지 않는다.

`.vitepress/config.js`의 `site.js` import에 `ADSENSE_CLIENT`를 추가한다.

```js
import { SITE_TITLE, SITE_DESCRIPTION, ADSENSE_CLIENT } from './lib/site.js'
```

`defineConfig` 최상위(`themeConfig` 바깥)에 `head`를 추가한다. Task 8에서 이 배열에 항목을 더 넣으므로 여기서 만들어 둔다.

```js
  head: [
    ...(ADSENSE_CLIENT
      ? [
          [
            'script',
            {
              async: '',
              crossorigin: 'anonymous',
              src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
            }
          ]
        ]
      : [])
  ],
```

`ADSENSE_CLIENT`가 빈 문자열이면 로더 스크립트도, `AdSlot`의 광고 요소도 나가지 않는다. 승인 전 배포 상태에서는 애드센스 관련 요청이 전혀 발생하지 않아야 한다.

- [ ] **Step 11: 빌드하고 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build && npm run preview
```

확인할 것:
- 페이지가 깨지지 않는다 (`ADSENSE_CLIENT`가 빈 문자열이므로 광고 자리는 보이지 않는 게 정상이다)
- 미집필 챕터 링크가 회색 「(집필 예정)」 표시로 나온다 — `/part2-korea-market/2-7-short-selling` 에서 확인
- 3단 레이아웃이 유지된다
- 브라우저 폭을 좁히면 사이드바가 햄버거로 접힌다

산출물에 중간 광고 슬롯이 들어갔는지 확인한다.

```bash
grep -l 'ad-slot--mid\|AdSlot' .vitepress/dist/part*/*.html | head
```

- [ ] **Step 12: 커밋**

```bash
git add .vitepress/theme/ .vitepress/lib/mid-content-ad.js .vitepress/lib/site.js .vitepress/config.js tests/unit/mid-content-ad.test.js
git commit -m "feat(site): 광고 슬롯과 커스텀 테마

상단·하단은 전 챕터, 중간은 섹션이 4개 이상인 챕터에만 넣는다.
챕터가 70~130줄로 짧아 3개를 다 넣으면 본문 대비 광고가 과하고
애드센스 정책상 감점 요인이다.

ADSENSE_CLIENT가 빈 문자열이면 AdSlot이 아무것도 렌더하지 않으므로
승인 전에도 그대로 배포할 수 있다."
```

---

### Task 7: 랜딩 페이지 · 정책 페이지 · 푸터

애드센스 심사에 사실상 필수인 정책 페이지 3개를 만들고, Task 1의 임시 랜딩을 완성한다.

**Files:**
- Create: `about/privacy.md`, `about/disclaimer.md`, `about/contact.md`
- Modify: `index.md`, `.vitepress/config.js`

**Interfaces:**
- Consumes: 없음 (정책 문안은 마크다운에 직접 쓴다)
- Produces: 없음

> **주의**: 아래 정책 문안은 일반적인 개인 블로그·정보성 사이트 기준으로 작성한 것이다. 법률 자문이 아니므로 배포 전에 사용자가 직접 읽고 사실과 맞는지 확인해야 한다. 특히 "수집하는 개인정보가 없다"는 서술은 이후 댓글·뉴스레터 등을 붙이면 사실이 아니게 된다.

- [ ] **Step 1: 랜딩 페이지 완성**

`index.md` 전체를 아래로 교체한다.

```markdown
---
layout: home
title: 주식·투자 상식 사전
titleTemplate: false
description: 증권계좌 개설부터 ETF·연금까지, 주식 투자에 필요한 상식을 검색 질문 하나에 하나씩 답하는 온라인 책이에요.

hero:
  name: 주식·투자 상식 사전
  text: 계좌 개설부터 ETF·연금까지
  tagline: 궁금한 것 하나에, 글 하나로 답해요. 처음부터 읽어도 되고 필요한 것만 골라 봐도 괜찮아요.
  actions:
    - theme: brand
      text: 1-1. 주식이란 무엇인가
      link: /part1-basics/1-1-what-is-stock
    - theme: alt
      text: 코스피 vs 코스닥
      link: /part2-korea-market/2-1-kospi-vs-kosdaq

features:
  - title: 검색해서 들어와도 완결
    details: 각 글은 검색 질문 하나에 끝까지 답해요. 앞 글을 안 읽었어도 이해할 수 있게 필요한 개념은 그 자리에서 설명해요.
  - title: 완전 초보부터
    details: 증권계좌가 아직 없는 분을 기준으로 썼어요. 용어는 처음 나올 때마다 풀어서 설명해요.
  - title: 특정 상품을 권하지 않아요
    details: 증권사 이름이나 종목을 추천하지 않아요. 제도와 개념을 설명하는 데만 집중해요.
---

## 어떤 책인가요

주식이 처음인 분들을 위한 투자 상식 사전이에요. 증권계좌를 아직 안 만들어본 완전 초보부터, 매매는 해봤지만 개념 정리가 안 된 입문자까지를 대상으로 해요.

각 챕터는 검색으로 궁금할 만한 질문 하나에 완결로 답하는 독립적인 글이에요. 그래서 처음부터 순서대로 읽어도 되고, 지금 궁금한 챕터만 골라 봐도 괜찮아요. 왼쪽 목차에서 전체 구성을 볼 수 있고, 위쪽 검색창에서 단어로 찾을 수도 있어요.

## 지금 어디까지 나와 있나요

파트 1(주식 투자, 처음이라면)과 파트 2(국내 주식시장 이해하기)가 완성돼 있어요. 파트 3 이후는 순서대로 채워 나가는 중이에요. 목차에 회색으로 보이는 챕터가 아직 집필 전인 글이에요.

---

> 이 사이트의 글은 투자 판단에 도움이 되는 일반적인 정보를 제공할 뿐, 특정 종목이나 상품의 매매를 권유하지 않아요. 제도와 세금은 바뀔 수 있으니 실제 투자 전에는 최신 내용을 다시 확인하세요. 자세한 내용은 [면책조항](/about/disclaimer)을 봐주세요.
```

- [ ] **Step 2: 면책조항 작성**

`about/disclaimer.md`:

```markdown
---
title: 면책조항
description: 이 사이트가 제공하는 정보의 성격과 한계를 안내해요.
---

# 면책조항

## 투자 권유가 아니에요

이 사이트의 모든 글은 주식·투자에 관한 **일반적인 정보와 제도 설명**을 제공할 뿐이에요. 특정 종목, 특정 금융상품, 특정 금융회사의 매매나 가입을 권유하지 않아요.

글에 나오는 숫자와 사례는 개념을 설명하기 위한 예시예요. 실제 수익률이나 결과를 보장하지 않아요.

## 투자 결정과 그 결과는 본인 책임이에요

이 사이트의 정보를 참고해서 내린 투자 판단과 그로 인한 손익은 전적으로 이용자 본인에게 귀속돼요. 운영자는 이용자의 투자 결과에 대해 어떠한 책임도 지지 않아요.

## 제도와 수치는 바뀌어요

세금, 수수료, 거래 시간, 각종 제도는 법령 개정이나 거래소 규정 변경으로 수시로 바뀌어요. 각 글에는 「2026년 7월 기준」처럼 그 내용이 언제를 기준으로 쓰였는지 표기해 두었어요.

**표기된 시점 이후에 제도가 바뀌었을 수 있어요.** 실제로 투자하거나 세금을 신고하기 전에는 금융위원회, 한국거래소, 국세청 등 공식 기관의 최신 안내를 반드시 다시 확인하세요.

## 정확성을 보장하지 않아요

글은 공식 자료를 근거로 작성하려고 노력하지만, 오류나 누락이 있을 수 있어요. 내용의 정확성·완전성·최신성을 보장하지 않아요.

잘못된 내용을 발견하시면 [문의](/about/contact)로 알려주세요. 확인해서 고칠게요.

## 전문가 상담을 대체하지 않아요

이 사이트는 세무, 법률, 투자자문 서비스를 제공하지 않아요. 개인의 구체적인 상황에 맞는 판단이 필요하면 세무사, 변호사, 투자권유자문인력 등 자격을 갖춘 전문가와 상담하세요.
```

- [ ] **Step 3: 개인정보처리방침 작성**

`about/privacy.md`:

```markdown
---
title: 개인정보처리방침
description: 이 사이트가 개인정보를 어떻게 다루는지, 광고 쿠키가 무엇을 하는지 안내해요.
---

# 개인정보처리방침

## 이 사이트가 직접 수집하는 정보

이 사이트는 회원가입, 로그인, 댓글 기능이 없어요. **운영자가 이용자에게 이름, 이메일, 전화번호 등의 개인정보를 직접 요구하거나 수집하지 않아요.**

[문의](/about/contact) 페이지를 통해 이메일을 보내주시는 경우에만 그 이메일에 담긴 정보를 받게 되며, 문의에 답변하는 목적으로만 사용하고 답변이 끝나면 별도로 보관하지 않아요.

## 광고와 쿠키

이 사이트는 구글 애드센스를 통해 광고를 게재해요.

- 구글을 포함한 제3자 광고 사업자는 **쿠키**를 사용해, 이용자가 이 사이트나 다른 사이트를 방문한 기록을 바탕으로 광고를 제공해요.
- 구글이 광고 쿠키를 사용함으로써 이용자의 방문 기록에 기반한 광고를 게재할 수 있어요.
- 이용자는 [구글 광고 설정](https://adssettings.google.com)에서 개인 맞춤 광고를 **끌 수 있어요.**
- 제3자 광고 사업자가 사용하는 쿠키를 끄는 방법은 [www.aboutads.info](https://www.aboutads.info/choices/)에서 확인할 수 있어요.
- 브라우저 설정에서 쿠키를 차단할 수도 있어요. 다만 쿠키를 차단해도 이 사이트의 글을 읽는 데는 지장이 없어요.

광고 사업자가 수집하는 정보는 해당 사업자의 개인정보처리방침을 따라요. 구글의 정책은 [구글 개인정보처리방침](https://policies.google.com/privacy)에서 볼 수 있어요.

## 접속 기록

이 사이트는 Cloudflare Pages에서 운영돼요. 사이트를 제공하는 과정에서 호스팅 제공자가 접속 로그(IP 주소, 브라우저 종류, 접속 시각 등)를 기록할 수 있어요. 운영자는 이 로그를 개인을 식별하는 용도로 사용하지 않아요.

## 아동의 개인정보

이 사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않아요.

## 방침 변경

이 방침이 바뀌면 이 페이지에서 알려드릴게요.

## 문의

개인정보 처리에 관해 궁금한 점이 있으시면 [문의](/about/contact) 페이지의 이메일로 연락해 주세요.
```

- [ ] **Step 4: 문의 페이지 작성**

`about/contact.md`:

```markdown
---
title: 문의
description: 사이트 운영자에게 연락하는 방법이에요.
---

# 문의

## 이메일

<yshyuk.63@gmail.com>

아래와 같은 내용을 보내주시면 확인할게요.

- **글의 오류 제보** — 어떤 글의 어느 부분인지 알려주시면 확인해서 고칠게요. 근거가 되는 공식 자료 링크를 함께 주시면 훨씬 빠르게 처리할 수 있어요.
- **제도 변경 알림** — 세금, 거래 시간, 각종 제도는 자주 바뀌어요. 글의 내용이 낡았다면 알려주세요.
- **저작권 관련 문제** — 이 사이트의 내용이 권리를 침해한다고 판단되시면 해당 부분과 근거를 알려주세요.
- **광고 관련 문의**

## 답변에 걸리는 시간

개인이 운영하는 사이트라 답변이 늦을 수 있어요. 보통 며칠 안에 확인해요.

## 답변드리기 어려운 것

- **개별 종목이나 상품에 대한 문의** — 이 사이트는 투자 권유나 자문을 하지 않아요. 자세한 내용은 [면책조항](/about/disclaimer)을 봐주세요.
- **개인의 구체적인 세무·법률 상담** — 세무사, 변호사 등 자격을 갖춘 전문가와 상담하세요.
```

- [ ] **Step 5: 푸터와 상단 내비게이션을 연결한다**

`.vitepress/config.js`의 `themeConfig` 안에 추가한다.

```js
    nav: [
      { text: '목차', link: '/part1-basics/1-1-what-is-stock' },
      { text: '이 책은', link: '/about/disclaimer' }
    ],

    footer: {
      message:
        '<a href="/about/privacy">개인정보처리방침</a> · <a href="/about/disclaimer">면책조항</a> · <a href="/about/contact">문의</a>',
      copyright: '이 사이트의 글은 투자 권유가 아니에요. 제도와 세금은 바뀔 수 있어요.'
    },
```

- [ ] **Step 6: 빌드하고 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build && npm run preview
```

확인할 것:
- 랜딩(`/`)에 hero와 3개 feature가 나온다
- hero의 두 버튼이 각각 1-1, 2-1로 이동한다
- 푸터의 링크 3개가 모든 페이지에 나오고 각각 열린다
- `/about/privacy`, `/about/disclaimer`, `/about/contact` 세 페이지가 다 열린다
- 문의 페이지의 이메일이 `mailto:` 링크로 동작한다

- [ ] **Step 7: 커밋**

```bash
git add index.md about/ .vitepress/config.js
git commit -m "feat(site): 랜딩 페이지와 정책 페이지 3종

애드센스 심사에 필요한 개인정보처리방침·면책조항·문의를 만들고
푸터에서 전 페이지에 연결했다. 개인정보처리방침은 광고 쿠키와
옵트아웃 경로를 명시한다.

정책 문안은 일반적인 정보성 사이트 기준으로 작성한 것이며
법률 자문이 아니다. 댓글·뉴스레터 등을 추가하면 다시 봐야 한다."
```

---

### Task 8: SEO — 메타 태그 · 사이트맵 · 구조화 데이터

챕터 frontmatter가 이미 SEO를 염두에 두고 쓰여 있다. 그대로 활용해 페이지별 메타를 채운다.

**Files:**
- Create: `.vitepress/lib/seo.js`, `public/robots.txt`, `public/ads.txt`, `tests/unit/seo.test.js`, `tests/build/seo.test.js`
- Modify: `.vitepress/config.js`

**Interfaces:**
- Consumes: `.vitepress/lib/site.js`, `.vitepress/lib/chapters.js`
- Produces:
  - `seo.js` → `export function canonicalUrl(relativePath): string`
  - `seo.js` → `export function pageHead(pageData): Array<[string, Record<string,string>] | [string, Record<string,string>, string]>` — VitePress `frontmatter.head`에 넣을 태그 배열

- [ ] **Step 1: 실패하는 단위 테스트를 작성한다**

`tests/unit/seo.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canonicalUrl, pageHead } from '../../.vitepress/lib/seo.js'
import { SITE_URL } from '../../.vitepress/lib/site.js'

test('챕터의 canonical URL', () => {
  assert.equal(
    canonicalUrl('part2-korea-market/2-7-short-selling.md'),
    `${SITE_URL}/part2-korea-market/2-7-short-selling`
  )
})

test('루트 index의 canonical URL은 슬래시로 끝난다', () => {
  assert.equal(canonicalUrl('index.md'), `${SITE_URL}/`)
})

test('정책 페이지의 canonical URL', () => {
  assert.equal(canonicalUrl('about/privacy.md'), `${SITE_URL}/about/privacy`)
})

const chapterPage = {
  relativePath: 'part2-korea-market/2-7-short-selling.md',
  title: '공매도란 무엇이고 왜 논란인가',
  description: '공매도는 갖고 있지 않은 주식을 먼저 빌려서 팔고, 나중에 싸게 사서 갚아 그 차익을 노리는 거래예요.',
  frontmatter: {
    title: '공매도란 무엇이고 왜 논란인가',
    description: '공매도는 갖고 있지 않은 주식을 먼저 빌려서 팔고, 나중에 싸게 사서 갚아 그 차익을 노리는 거래예요.',
    keywords: ['공매도란', '공매도 뜻'],
    part: 2,
    order: 7,
    date: '2026-07-28'
  }
}

function findTag(head, tag, key, value) {
  return head.find(([t, attrs]) => t === tag && attrs[key] === value)
}

test('canonical link 태그가 들어간다', () => {
  const head = pageHead(chapterPage)
  const link = findTag(head, 'link', 'rel', 'canonical')
  assert.ok(link)
  assert.equal(link[1].href, `${SITE_URL}/part2-korea-market/2-7-short-selling`)
})

test('og 태그가 들어간다', () => {
  const head = pageHead(chapterPage)
  assert.equal(findTag(head, 'meta', 'property', 'og:type')[1].content, 'article')
  assert.equal(findTag(head, 'meta', 'property', 'og:locale')[1].content, 'ko_KR')
  assert.equal(
    findTag(head, 'meta', 'property', 'og:title')[1].content,
    '공매도란 무엇이고 왜 논란인가'
  )
  assert.match(
    findTag(head, 'meta', 'property', 'og:description')[1].content,
    /공매도는 갖고 있지 않은/
  )
})

test('작성일이 article:published_time으로 들어간다', () => {
  const head = pageHead(chapterPage)
  assert.equal(
    findTag(head, 'meta', 'property', 'article:published_time')[1].content,
    '2026-07-28'
  )
})

test('JSON-LD에 Article과 BreadcrumbList가 들어간다', () => {
  const head = pageHead(chapterPage)
  const script = head.find(([t, attrs]) => t === 'script' && attrs.type === 'application/ld+json')
  assert.ok(script)
  const data = JSON.parse(script[2])
  const types = data['@graph'].map((n) => n['@type'])
  assert.deepEqual(types, ['Article', 'BreadcrumbList'])
  const breadcrumb = data['@graph'][1].itemListElement
  assert.equal(breadcrumb.at(-1).name, '공매도란 무엇이고 왜 논란인가')
  assert.equal(breadcrumb[1].name, '파트 2. 국내 주식시장 이해하기')
})

test('챕터가 아닌 페이지는 og:type이 website고 JSON-LD가 없다', () => {
  const head = pageHead({
    relativePath: 'about/privacy.md',
    title: '개인정보처리방침',
    description: '이 사이트가 개인정보를 어떻게 다루는지 안내해요.',
    frontmatter: { title: '개인정보처리방침', description: '이 사이트가 개인정보를 어떻게 다루는지 안내해요.' }
  })
  assert.equal(findTag(head, 'meta', 'property', 'og:type')[1].content, 'website')
  assert.equal(
    head.some(([t, attrs]) => t === 'script' && attrs.type === 'application/ld+json'),
    false
  )
})
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/seo.test.js
```

기대: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

`.vitepress/lib/seo.js`:

```js
import { SITE_URL, SITE_TITLE } from './site.js'
import { PARTS } from './chapters.js'

/** `part2-korea-market/2-7-short-selling.md` → 절대 URL */
export function canonicalUrl(relativePath) {
  const path = relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')
  return `${SITE_URL}/${path}`
}

function articleGraph(pageData, url) {
  const { frontmatter: fm } = pageData
  const part = PARTS.find((p) => p.part === fm.part)

  const breadcrumb = [
    { '@type': 'ListItem', position: 1, name: SITE_TITLE, item: `${SITE_URL}/` }
  ]
  if (part) {
    breadcrumb.push({ '@type': 'ListItem', position: 2, name: part.title })
  }
  breadcrumb.push({
    '@type': 'ListItem',
    position: breadcrumb.length + 1,
    name: fm.title,
    item: url
  })

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: fm.title,
        description: fm.description,
        datePublished: fm.date,
        inLanguage: 'ko-KR',
        mainEntityOfPage: url,
        isPartOf: { '@type': 'Book', name: SITE_TITLE, url: `${SITE_URL}/` },
        ...(fm.keywords?.length ? { keywords: fm.keywords.join(', ') } : {})
      },
      { '@type': 'BreadcrumbList', itemListElement: breadcrumb }
    ]
  }
}

/**
 * 페이지 하나에 붙일 head 태그 배열을 만든다.
 * VitePress의 transformPageData에서 frontmatter.head에 밀어 넣는다.
 */
export function pageHead(pageData) {
  const fm = pageData.frontmatter ?? {}
  const url = canonicalUrl(pageData.relativePath)
  const title = fm.title ?? pageData.title ?? SITE_TITLE
  const description = fm.description ?? pageData.description ?? ''
  const isChapter = typeof fm.part === 'number' && typeof fm.order === 'number'

  const head = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: isChapter ? 'article' : 'website' }],
    ['meta', { property: 'og:locale', content: 'ko_KR' }],
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }]
  ]

  if (isChapter && fm.date) {
    head.push(['meta', { property: 'article:published_time', content: String(fm.date) }])
  }

  if (isChapter) {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(articleGraph(pageData, url))
    ])
  }

  return head
}
```

- [ ] **Step 4: 테스트를 돌려 통과를 확인한다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && node --test tests/unit/seo.test.js
```

기대: 8개 테스트 모두 PASS.

`date`가 YAML에서 Date 객체로 파싱될 수 있어 `String(fm.date)`로 감쌌다. 실제 빌드 산출물에서 형식이 `2026-07-28`이 아니라 ISO 전체 문자열로 나오면 Step 8에서 잡힌다.

- [ ] **Step 5: 설정에 연결한다**

`.vitepress/config.js`에 import를 추가한다.

```js
import { pageHead } from './lib/seo.js'
import { SITE_URL } from './lib/site.js'
```

(`SITE_URL`은 Task 1에서 이미 import했다면 중복 추가하지 않는다.)

Task 6 Step 10에서 만든 `head` 배열에 아래 두 항목을 **추가**한다. 배열을 새로 만들지 않는다.

```js
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }]
```

`defineConfig` 최상위(`themeConfig` 바깥)에 아래를 추가한다.

```js
  sitemap: {
    hostname: SITE_URL
  },

  transformPageData(pageData) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(...pageHead(pageData))
  },
```

- [ ] **Step 6: `robots.txt` 작성**

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://stock-wiki.digestive-coffee.blog/sitemap.xml
```

- [ ] **Step 7: `ads.txt` 자리를 만든다**

`public/ads.txt`:

```
# 애드센스 승인 후 아래 줄의 주석을 풀고 발행자 ID를 채운다.
# 형식: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- [ ] **Step 8: 산출물 검사 테스트를 작성한다**

`tests/build/seo.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../../.vitepress/dist/', import.meta.url).pathname
const CHAPTER = join(DIST, 'part2-korea-market/2-7-short-selling.html')

test('sitemap.xml이 생성된다', () => {
  const path = join(DIST, 'sitemap.xml')
  assert.ok(existsSync(path), 'sitemap.xml이 없습니다')
  const xml = readFileSync(path, 'utf8')

  for (const url of [
    'https://stock-wiki.digestive-coffee.blog/part2-korea-market/2-7-short-selling',
    'https://stock-wiki.digestive-coffee.blog/about/privacy',
    'https://stock-wiki.digestive-coffee.blog/about/disclaimer',
    'https://stock-wiki.digestive-coffee.blog/about/contact'
  ]) {
    assert.ok(xml.includes(url), `sitemap에 ${url}이 없습니다`)
  }
})

test('sitemap에 미집필 챕터가 들어가지 않는다', () => {
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
  assert.equal(xml.includes('part3-us-overseas'), false)
})

test('robots.txt가 sitemap을 가리킨다', () => {
  const txt = readFileSync(join(DIST, 'robots.txt'), 'utf8')
  assert.match(txt, /Sitemap: https:\/\/stock-wiki\.digestive-coffee\.blog\/sitemap\.xml/)
})

test('챕터 페이지에 canonical과 og 태그가 있다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/stock-wiki\.digestive-coffee\.blog\/part2-korea-market\/2-7-short-selling">/
  )
  assert.match(html, /property="og:type" content="article"/)
  assert.match(html, /property="og:locale" content="ko_KR"/)
})

test('챕터 페이지의 meta description이 frontmatter description이다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  assert.match(html, /<meta name="description" content="공매도는 갖고 있지 않은 주식을/)
})

test('챕터 페이지에 JSON-LD가 있고 파싱된다', () => {
  const html = readFileSync(CHAPTER, 'utf8')
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  )
  assert.ok(match, 'JSON-LD script 태그가 없습니다')
  const data = JSON.parse(match[1])
  assert.equal(data['@graph'][0]['@type'], 'Article')
  assert.equal(data['@graph'][0].datePublished, '2026-07-28')
})
```

- [ ] **Step 9: 빌드하고 전체 테스트를 돌린다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build && npm test
```

기대: 모든 테스트 PASS.

`datePublished`가 `2026-07-28`이 아니라 `2026-07-28T00:00:00.000Z` 형태로 나오면, `.vitepress/lib/seo.js`의 날짜 처리를 아래로 바꾸고 다시 돌린다.

```js
function toDateString(value) {
  if (!value) return undefined
  const s = value instanceof Date ? value.toISOString() : String(value)
  return s.slice(0, 10)
}
```

그리고 `articleGraph`의 `datePublished: fm.date`를 `datePublished: toDateString(fm.date)`로, `pageHead`의 `content: String(fm.date)`를 `content: toDateString(fm.date)`로 바꾼다.

- [ ] **Step 10: 커밋**

```bash
git add .vitepress/lib/seo.js .vitepress/config.js public/ tests/unit/seo.test.js tests/build/seo.test.js
git commit -m "feat(site): SEO 메타·사이트맵·구조화 데이터

챕터 frontmatter의 title/description/date/keywords를 canonical, og,
article:published_time, JSON-LD(Article + BreadcrumbList)로 연결했다.
사이트맵과 robots.txt를 붙이고 ads.txt는 승인 후 채울 자리만 만들었다."
```

---

### Task 9: GitHub 공개 저장소 · Cloudflare Pages 배포

**Files:**
- 코드 변경 없음. 저장소·외부 서비스 설정.

**Interfaces:**
- Consumes: Task 1~8의 결과물 (`npm run build`가 성공하는 상태)
- Produces: `https://stock-wiki.digestive-coffee.blog`

> 이 태스크는 Cloudflare 대시보드와 호스팅kr 관리 화면 조작을 포함한다. 그 부분은 에이전트가 대신 할 수 없으므로 **사용자에게 정확한 단계를 안내하고 결과를 확인받는다.**

- [ ] **Step 1: `feat/site`를 `main`에 머지한다**

Cloudflare Pages의 프로덕션 브랜치를 `main`으로 쓰므로 먼저 머지한다.

```bash
git checkout main
git merge --no-ff feat/site -m "merge: 사이트 구축 (VitePress + Cloudflare Pages)"
git log --oneline -1
```

- [ ] **Step 2: GitHub 공개 저장소를 만들고 푸시한다**

```bash
gh repo create stock-wiki --public --source=. --remote=origin --push
```

기대: 저장소 URL이 출력되고 푸시가 끝난다.

```bash
git remote -v
gh repo view --web
```

브라우저에서 `README.md`가 보이고 `part1-basics/` 등이 올라갔는지 확인한다.

- [ ] **Step 3: Cloudflare Pages 프로젝트를 만든다 — 사용자 작업**

사용자에게 아래를 안내하고 완료를 확인받는다.

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 계정을 연결하고 `yshyuk/stock-wiki` 저장소를 선택
3. 빌드 설정을 아래대로 입력

   | 항목 | 값 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `VitePress` (없으면 `None`) |
   | Build command | `npm run build` |
   | Build output directory | `.vitepress/dist` |
   | Root directory | (비워둠) |

4. **Save and Deploy**

빌드 로그에서 `build complete`가 나오고 `*.pages.dev` 주소가 발급되는지 확인한다. Node 버전은 `.nvmrc`(22)를 자동으로 읽는다.

- [ ] **Step 4: `*.pages.dev` 임시 주소에서 사이트를 확인한다**

발급된 주소로 접속해 확인한다.

- 랜딩 페이지가 뜬다
- 챕터 페이지가 열린다
- 검색 모달이 동작한다
- mermaid 다이어그램이 렌더된다
- 목차 트리가 나온다

여기서 깨지면 Cloudflare 빌드 로그를 읽고 원인을 찾는다. 로컬에서만 되고 배포에서 깨지는 흔한 원인은 대소문자 구분 파일 시스템 차이다.

- [ ] **Step 5: 커스텀 도메인을 Pages에 먼저 등록한다 — 사용자 작업**

**순서가 중요하다.** Cloudflare 문서가 명시적으로 경고하는 항목으로, Pages에 도메인을 등록하지 않고 CNAME만 먼저 만들면 도메인이 해석되지 않는다.

1. Pages 프로젝트 → **Custom domains** → **Set up a custom domain**
2. `stock-wiki.digestive-coffee.blog` 입력 → **Continue**
3. Cloudflare가 안내하는 CNAME 대상 값(`<프로젝트명>.pages.dev`)을 기록한다

- [ ] **Step 6: 호스팅kr에서 CNAME을 추가한다 — 사용자 작업**

호스팅kr DNS 관리 화면에서 레코드를 추가한다.

| 항목 | 값 |
|---|---|
| 타입 | CNAME |
| 호스트/이름 | `stock-wiki` (UI가 FQDN을 요구하면 `stock-wiki.digestive-coffee.blog`) |
| 값/대상 | Step 5에서 기록한 `<프로젝트명>.pages.dev` |
| TTL | 기본값 |

호스트 칸에 무엇을 넣어야 하는지는 호스팅kr UI 규약에 따른다. 화면을 확인한 뒤 판단한다.

- [ ] **Step 7: 전파와 인증서 발급을 확인한다**

```bash
dig +short stock-wiki.digestive-coffee.blog CNAME
curl -sI https://stock-wiki.digestive-coffee.blog | head -5
```

기대: CNAME이 `*.pages.dev`를 가리키고, HTTPS 응답이 `HTTP/2 200`이다.

DNS 전파와 인증서 발급에 시간이 걸린다. Cloudflare 대시보드의 Custom domains에서 상태가 **Active**가 될 때까지 기다린다.

- [ ] **Step 8: 실제 도메인에서 최종 확인**

`https://stock-wiki.digestive-coffee.blog` 에서 Step 4의 항목을 다시 확인하고, 추가로 아래를 본다.

```bash
curl -s https://stock-wiki.digestive-coffee.blog/sitemap.xml | head -20
curl -s https://stock-wiki.digestive-coffee.blog/robots.txt
```

기대: 사이트맵의 URL이 `pages.dev`가 아니라 커스텀 도메인이다.

- [ ] **Step 9: 배포 정보를 기록한다**

Pages 프로젝트명, `*.pages.dev` 주소, 배포 확인 일시를 이 계획서 맨 아래 「배포 정보」 절에 적는다.

---

### Task 10: 최종 검수 · 인계 문서 갱신

설계 문서 13장의 완료 판정 기준 9개를 하나씩 확인하고, 이 프로젝트에서 해결된 숙제와 새로 생긴 인계 사항을 `handoffs.md`에 반영한다.

**Files:**
- Modify: `docs/handoffs.md`, `docs/superpowers/plans/2026-07-31-stock-wiki-site.md`

**Interfaces:**
- Consumes: Task 1~9의 결과 전부
- Produces: 갱신된 `handoffs.md`

- [ ] **Step 1: 완료 판정 기준을 하나씩 확인한다**

각 항목을 실제로 실행해 확인하고, 아래 표를 이 계획서 맨 아래 「완료 판정 결과」 절에 채운다. **통과했다고 적기 전에 반드시 명령을 돌리고 출력을 본다.**

| # | 기준 | 확인 방법 | 결과 |
|---|---|---|---|
| 1 | 빌드 성공, 깨진 링크 0 | `npm run build` | |
| 2 | 산출물에 내부 문서 없음 | `npm test` (`tests/build/output.test.js`) | |
| 3 | mermaid 4건 실제 렌더 | Task 5 Step 6의 표 | |
| 4 | 조사 케이스 검색 통과 + 합성어 측정 기록 | `npm test` + Task 4 Step 10의 기록 | |
| 5 | 미집필 링크 14곳이 「집필 예정」 | `grep -o 'planned-link' .vitepress/dist/part*/*.html \| wc -l` | |
| 6 | 사이드바에 39개, 활성 13개 | `npm test` (`tests/unit/sidebar.test.js`) + 육안 | |
| 7 | 3단·다크모드·모바일 | 배포된 사이트 육안 | |
| 8 | 정책 페이지 3개가 푸터에 연결 | 배포된 사이트 육안 | |
| 9 | sitemap에 13챕터+랜딩+정책 | `npm test` (`tests/build/seo.test.js`) | |

- [ ] **Step 2: 전체 테스트를 돌린다**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use && npm run build && npm test
```

기대: 모든 테스트 PASS. 출력을 그대로 기록한다.

- [ ] **Step 3: `handoffs.md`의 해결된 숙제를 정리한다**

`docs/handoffs.md`의 8장 「사이트 구축 프로젝트로 넘길 사항」을 아래로 교체한다.

```markdown
## 8. 사이트 구축 프로젝트 — 완료 (2026-07-31)

사이트는 VitePress로 구축해 `https://stock-wiki.digestive-coffee.blog`에 배포했어요.
설계는 `docs/superpowers/specs/2026-07-30-stock-wiki-site-design.md`,
구현 계획과 검증 결과는 `docs/superpowers/plans/2026-07-31-stock-wiki-site.md`에 있어요.

### 해결된 숙제

- **mermaid 다이어그램 4건 실제 렌더 검증 완료** — 1-1, 1-2, 2-4, 2-7. 그동안 정적 문법 검사만
  거쳤던 것들이에요. 결과는 계획서의 「mermaid 렌더 검증 결과」 절에 있어요.

### 집필할 때 알아야 할 것

- **마크다운은 그대로 두면 돼요.** 사이트가 빌드 시점에 변형을 처리해요. 미집필 챕터를 가리키는
  링크를 미리 써 둬도 「집필 예정」 표시로 렌더되고, 그 챕터를 쓰면 자동으로 링크가 살아나요.
- **`##` 섹션이 4개 이상이면 3번째 섹션 앞에 광고가 들어가요.** 섹션 구성을 짤 때 참고하세요.
- **frontmatter의 `keywords`가 검색 색인에 들어가요.** 그동안은 쓰이지 않았는데 이제 실제
  검색어로 동작하니, 독자가 칠 법한 표현을 넣어 주세요.
- **`description`은 검색 결과와 SNS 미리보기에 그대로 노출돼요.** 이미 그렇게 쓰고 있지만,
  앞으로도 문장으로 완결되게 써 주세요.
- **`date`는 구조화 데이터의 `datePublished`가 돼요.**
- 챕터를 새로 쓰면 `.vitepress/lib/chapters.js`의 목차 데이터와 파일명이 일치하는지 확인하세요.
  불일치하면 사이드바에 안 나오거나 빈 항목이 생겨요.

### 남은 사항

- **애드센스 미신청.** 광고 슬롯과 정책 페이지는 준비됐고, `.vitepress/lib/site.js`의
  `ADSENSE_CLIENT`와 `public/ads.txt`에 발행자 ID만 채우면 켜져요.
- **`digestive-coffee.blog`에 다른 콘텐츠가 있는지 확인 필요.** 애드센스가 상위 도메인 단위로
  심사할 가능성이 있어요.
- **`images/` 폴더 7개는 여전히 비어 있어요.** 첫 이미지가 규약(파일명·대체 텍스트·저장 경로)의
  첫 시험대가 돼요.
```

- [ ] **Step 4: 검색 측정 결과를 `handoffs.md`에 옮긴다**

Task 4 Step 10에 기록한 합성어 내부 일치 측정 결과를 `handoffs.md`의 3장(주기적 재확인이 필요한 수치 목록) 아래에 새 절로 추가한다. 다음에 검색 개선을 검토할 때의 출발점이 된다.

- [ ] **Step 5: 계획서의 결과 절을 모두 채웠는지 확인한다**

이 계획서 맨 아래 네 개 절(「mermaid 렌더 검증 결과」, 「검색 재현율 측정 결과」, 「배포 정보」, 「완료 판정 결과」)이 전부 채워져 있어야 한다. 빈 칸이 있으면 해당 태스크로 돌아간다.

- [ ] **Step 6: 커밋하고 푸시한다**

```bash
git add docs/handoffs.md docs/superpowers/plans/2026-07-31-stock-wiki-site.md
git commit -m "docs: 사이트 구축 완료 — 검증 결과 기록 및 인계 문서 갱신

완료 판정 기준 9개 확인 결과와 mermaid 렌더 검증, 검색 재현율 측정
결과를 계획서에 기록했다. handoffs 8장을 '넘길 사항'에서 '완료'로
바꾸고, 앞으로 챕터를 쓸 때 알아야 할 사이트 동작을 정리했다."
git push
```

- [ ] **Step 7: 태그를 붙인다**

파트 1이 v0.1.0, 파트 2가 v0.2.0이었다. 사이트 구축은 콘텐츠가 아니라 기능 추가이므로 마이너 버전을 올린다.

```bash
git tag -a v0.3.0 -m "사이트 구축 — VitePress + Cloudflare Pages 배포"
git push origin v0.3.0
```

---

## mermaid 렌더 검증 결과

*(Task 5 Step 6에서 채운다)*

| 파일 | 렌더 | 한글 | 다크모드 | 모바일 | 수정 여부 |
|---|---|---|---|---|---|
| 1-1 | | | | | |
| 1-2 | | | | | |
| 2-4 | | | | | |
| 2-7 | | | | | |

---

## 검색 재현율 측정 결과

조사 부착 케이스 (통과 필수) — `node --test tests/unit/search-recall.test.js`, 5개 테스트 전부 PASS:

| 질의 | 기대 챕터 | 결과 |
|---|---|---|
| 공매도 | 2-7 | PASS (2-7이 상위 3건에 포함) |
| 배당락 | 2-3 | PASS (2-3이 상위 3건에 포함) |
| 서킷브레이커 | 2-6 | PASS (2-6이 상위 3건에 포함) |
| 액면분할 | 2-5 | PASS (2-5가 상위 3건에 포함) |

합성어 내부 일치 (측정만) — `npm run measure:search` 출력, 색인 문서 13건 기준:

| 질의 | 결과 건수 | 상위 3건 |
|---|---|---|
| 거래소 | 13 | 1-4-trading-hours, 1-6-market-cap-price-volume, 2-6-price-limit-circuit-breaker |
| 증자 | 3 | 2-2-how-kospi-index-works, 2-5-capital-increase-and-split, 1-6-market-cap-price-volume |
| 수수료 | 7 | 1-5-fees-and-taxes, 1-2-open-brokerage-account, 2-7-short-selling |

판단: `거래소`가 13건 전부(=색인의 전체 문서)를 fuzzy:0.2로 느슨하게 맞히면서, 정작 "한국거래소"를 본문에서 다루는 2-1(코스피 코스닥 차이)은 상위 3건에커녕 13건 중 13위(최하위)로 밀려난다 — 합성어 내부 일치를 못 잡는 손실이 실측으로 확인됐다. 반면 `증자`·`수수료`는 결과 건수가 3~7건으로 적당하고 기대 챕터(2-5, 1-5)가 상위 3건 안에 들어, keywords 주입만으로 조사 부착·다어절 질의는 충분히 커버된다. 접미사 색인은 지금 시점에서 도입하지 않는다 — 근거: (1) 관측된 손실이 `거래소` 1건뿐이고 나머지 대표 합성어 질의는 정상 작동한다, (2) 접미사 색인은 색인 크기를 3~5배 늘려 초기 로딩(광고 수익 직결)에 비용을 지우는데 그 비용을 정당화할 만큼 광범위한 손실이 아직 관측되지 않았다, (3) 실제 사용자 검색 로그가 쌓이면 그때 재측정해 도입 여부를 다시 판단하는 편이 근거가 더 튼튼하다.

---

## 배포 정보

*(Task 9 Step 9에서 채운다)*

- Cloudflare Pages 프로젝트명:
- 임시 주소(`*.pages.dev`):
- 커스텀 도메인 Active 확인 일시:

---

## 완료 판정 결과

*(Task 10 Step 1에서 채운다)*

| # | 기준 | 결과 |
|---|---|---|
| 1 | 빌드 성공, 깨진 링크 0 | |
| 2 | 산출물에 내부 문서 없음 | |
| 3 | mermaid 4건 실제 렌더 | |
| 4 | 검색 조사 케이스 통과 + 합성어 측정 기록 | |
| 5 | 미집필 링크 14곳 「집필 예정」 | |
| 6 | 사이드바 39개, 활성 13개 | |
| 7 | 3단·다크모드·모바일 | |
| 8 | 정책 페이지 3개 푸터 연결 | |
| 9 | sitemap 완전성 | |
