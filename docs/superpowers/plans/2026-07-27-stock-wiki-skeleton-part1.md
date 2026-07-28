# stock-wiki 골격 + 파트 1 집필 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** stock-wiki 저장소 골격(폴더·README 목차·챕터 템플릿)을 만들고, 파트 1(주식 투자, 처음이라면) 6개 챕터를 집필한다.

**Architecture:** 마크다운 파일 기반의 책 구조. 각 챕터는 검색 질문 하나에 완결로 답하는 독립 글이며, YAML frontmatter(SEO 메타데이터)를 포함해 추후 정적 사이트 생성기에 그대로 얹는다.

**Tech Stack:** Markdown, mermaid(다이어그램), git. 빌드 도구 없음(사이트 구축은 범위 밖).

## Global Constraints

설계 문서 `docs/superpowers/specs/2026-07-27-stock-wiki-design.md`의 규칙. 모든 태스크에 적용:

1. 각 챕터는 하나의 검색 질문에 완결로 답한다 (제목도 검색 질문형).
2. 앞 챕터 지식이 필요하면 한두 줄 요약 + 내부 링크로 처리한다.
3. 초보 눈높이의 구체적 예시를 챕터당 최소 1개 포함한다.
4. 트렌드 파트 글에는 작성일 명시 (이번 계획 범위 아님).
5. 트렌드 집필 시 웹 리서치 병행 (이번 계획 범위 아님).
6. 파일 형식은 마크다운.
7. 개념 설명에 도움이 되면 도형·시각화 자료를 적극 넣는다. 다이어그램은 mermaid 우선, 복잡한 그림은 파트 폴더 하위 `images/`에 저장.
- 파일명 형식: `챕터번호-영문슬러그.md` (예: `1-1-what-is-stock.md`). 슬러그는 사이트 URL로 재사용된다.
- 대상 독자: 완전 초보 + 입문자. 중급 심화 금지.
- 집필 순서: 파트 1 → 2 → 3 → 4 → 5 → 6 순서로 진행하고 파트 7(트렌드)은 수시 추가. 이번 계획은 파트 1까지만.

## 챕터 frontmatter 규격 (모든 챕터 공통)

```yaml
---
title: "챕터 제목 (검색 질문형)"
description: "검색 결과에 노출될 1~2문장 요약 (SEO meta description)"
keywords: ["핵심 검색어1", "검색어2", "검색어3"]
part: 1
order: 1
date: 2026-07-27
---
```

## 검증 체크리스트 (모든 챕터 태스크의 "테스트")

챕터 태스크마다 아래를 확인한다:

- [ ] frontmatter에 title/description/keywords/part/order/date 6개 필드가 모두 있다
- [ ] 글만 읽고 제목의 질문에 답이 완결된다 (다른 챕터를 안 읽어도 이해 가능)
- [ ] 구체적 예시가 1개 이상 있다 (실제 숫자를 넣은 계산 예시 권장)
- [ ] 태스크에 명시된 시각화 자료(mermaid/표)가 포함되어 있다
- [ ] 다른 챕터 개념 언급 시 상대경로 내부 링크가 걸려 있다
- [ ] 중급 이상 심화 내용이 없다

---

### Task 1: 저장소 골격 생성

**Files:**
- Create: `part1-basics/images/.gitkeep`
- Create: `part2-korea-market/images/.gitkeep`
- Create: `part3-us-overseas/images/.gitkeep`
- Create: `part4-etf-pension/images/.gitkeep`
- Create: `part5-analysis/images/.gitkeep`
- Create: `part6-common-sense/images/.gitkeep`
- Create: `part7-trends/images/.gitkeep`

**Interfaces:**
- Consumes: 없음
- Produces: 파트 폴더 7개 (이후 모든 챕터 파일의 저장 위치)

- [ ] **Step 1: 파트 폴더 + images 하위 폴더 생성**

```bash
cd /Users/yshyuk/Documents/Repository/stock-wiki
for d in part1-basics part2-korea-market part3-us-overseas part4-etf-pension part5-analysis part6-common-sense part7-trends; do
  mkdir -p "$d/images" && touch "$d/images/.gitkeep"
done
```

- [ ] **Step 2: 폴더 7개가 생겼는지 확인**

Run: `ls -d part*/`
Expected: 위 7개 폴더가 모두 출력

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: 파트 폴더 골격 생성"
```

---

### Task 2: 챕터 템플릿 작성

**Files:**
- Create: `docs/chapter-template.md`

**Interfaces:**
- Consumes: 없음
- Produces: 모든 챕터 태스크가 복사해서 시작하는 템플릿 (frontmatter 규격 + 본문 구성)

- [ ] **Step 1: 템플릿 파일 작성**

`docs/chapter-template.md`:

````markdown
---
title: "챕터 제목 — 검색 질문형으로"
description: "1~2문장 요약. 검색 결과 미리보기에 노출된다고 생각하고 작성"
keywords: ["검색어1", "검색어2", "검색어3"]
part: 0
order: 0
date: 2026-01-01
---

# (title과 동일한 제목)

<!-- 도입: 독자가 검색해서 들어온 질문을 첫 문단에서 바로 받아준다. 2~4문장 -->

## 핵심 답변

<!-- 질문에 대한 답을 먼저 요약. 그 뒤 섹션에서 풀어 설명 -->

## (개념 설명 섹션 1~3개, 제목은 내용에 맞게)

<!-- 필요 시 mermaid 다이어그램 또는 표 사용:
```mermaid
flowchart LR
    A[개념] --> B[개념]
```
-->

## 예시로 이해하기

<!-- 실제 숫자를 넣은 구체적 예시 최소 1개. 필수 -->

## 한 줄 정리

<!-- 챕터 전체를 1~3문장으로 요약 -->

<!-- 관련 챕터 내부 링크:
> 함께 보면 좋은 글: [1-6. 시가총액·주가·거래량, 숫자 읽는 법](1-6-market-cap-price-volume.md)
-->
````

- [ ] **Step 2: 템플릿에 frontmatter 6개 필드가 있는지 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' docs/chapter-template.md`
Expected: `6`

- [ ] **Step 3: Commit**

```bash
git add docs/chapter-template.md && git commit -m "docs: 챕터 템플릿 추가"
```

---

### Task 3: README 작성 (책 소개 + 전체 목차 + 진행 현황)

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: Task 1의 폴더 구조 (목차 링크 경로가 폴더명과 일치해야 함)
- Produces: 전체 챕터의 확정 파일명. 이후 모든 챕터 태스크는 여기 링크된 파일명을 그대로 사용

- [ ] **Step 1: README.md 작성**

내용 구성:
1. 책 제목: **주식·투자 상식 사전 — 계좌 개설부터 ETF·연금까지**
2. 소개 2~3문단: 대상 독자(완전 초보~입문자), 읽는 법(순서대로 읽어도 되고 필요한 글만 봐도 됨), 파트 7은 수시 업데이트라는 안내
3. 전체 목차: 설계 문서 5장의 7개 파트 39개 챕터를 체크박스 목록으로. 각 항목은 `- [ ] [1-1. 주식이란 무엇인가 — 회사 지분을 산다는 것의 의미](part1-basics/1-1-what-is-stock.md)` 형식 (체크박스가 곧 진행 현황). 파일명은 아래 슬러그 표를 그대로 사용:

| 챕터 | 파일 경로 |
|---|---|
| 1-1 | `part1-basics/1-1-what-is-stock.md` |
| 1-2 | `part1-basics/1-2-open-brokerage-account.md` |
| 1-3 | `part1-basics/1-3-how-to-buy-stocks.md` |
| 1-4 | `part1-basics/1-4-trading-hours.md` |
| 1-5 | `part1-basics/1-5-fees-and-taxes.md` |
| 1-6 | `part1-basics/1-6-market-cap-price-volume.md` |
| 2-1 | `part2-korea-market/2-1-kospi-vs-kosdaq.md` |
| 2-2 | `part2-korea-market/2-2-how-kospi-index-works.md` |
| 2-3 | `part2-korea-market/2-3-dividend-basics.md` |
| 2-4 | `part2-korea-market/2-4-ipo-subscription.md` |
| 2-5 | `part2-korea-market/2-5-capital-increase-and-split.md` |
| 2-6 | `part2-korea-market/2-6-price-limit-circuit-breaker.md` |
| 2-7 | `part2-korea-market/2-7-short-selling.md` |
| 3-1 | `part3-us-overseas/3-1-why-us-stocks.md` |
| 3-2 | `part3-us-overseas/3-2-us-trading-hours.md` |
| 3-3 | `part3-us-overseas/3-3-us-stock-tax.md` |
| 3-4 | `part3-us-overseas/3-4-exchange-rate.md` |
| 3-5 | `part3-us-overseas/3-5-us-indices.md` |
| 3-6 | `part3-us-overseas/3-6-us-dividend-investing.md` |
| 4-1 | `part4-etf-pension/4-1-what-is-etf.md` |
| 4-2 | `part4-etf-pension/4-2-index-investing.md` |
| 4-3 | `part4-etf-pension/4-3-how-to-choose-etf.md` |
| 4-4 | `part4-etf-pension/4-4-pension-fund-vs-irp.md` |
| 4-5 | `part4-etf-pension/4-5-isa-account.md` |
| 4-6 | `part4-etf-pension/4-6-tax-account-priority.md` |
| 5-1 | `part5-analysis/5-1-how-to-read-dart.md` |
| 5-2 | `part5-analysis/5-2-per.md` |
| 5-3 | `part5-analysis/5-3-pbr-roe.md` |
| 5-4 | `part5-analysis/5-4-income-statement.md` |
| 5-5 | `part5-analysis/5-5-debt-ratio.md` |
| 5-6 | `part5-analysis/5-6-limits-of-valuation.md` |
| 6-1 | `part6-common-sense/6-1-interest-rate-and-stocks.md` |
| 6-2 | `part6-common-sense/6-2-inflation.md` |
| 6-3 | `part6-common-sense/6-3-diversification.md` |
| 6-4 | `part6-common-sense/6-4-investor-psychology.md` |
| 6-5 | `part6-common-sense/6-5-compound-interest.md` |
| 6-6 | `part6-common-sense/6-6-reading-economic-news.md` |
| 6-7 | `part6-common-sense/6-7-investment-scams.md` |
| 7-1 | `part7-trends/2026-h2-market-trends.md` |

4. 집필 순서 안내: 파트 1→2→3→4→5→6 순차, 파트 7은 수시 추가
5. 집필 규칙 요약과 설계 문서 링크 (`docs/superpowers/specs/2026-07-27-stock-wiki-design.md`)

- [ ] **Step 2: 목차 링크 39개가 있는지 확인**

Run: `grep -c -E '^\- \[[ x]\] \[' README.md`
Expected: `39` (파트별 6+7+6+6+6+7+1)

- [ ] **Step 3: Commit**

```bash
git add README.md && git commit -m "docs: README 목차·진행 현황 추가"
```

---

### Task 4: 챕터 1-1 집필 — 주식이란 무엇인가

**Files:**
- Create: `part1-basics/1-1-what-is-stock.md`
- Modify: `README.md` (해당 챕터 체크박스를 `[x]`로)

**Interfaces:**
- Consumes: `docs/chapter-template.md` 구조, README의 파일명
- Produces: 1-6, 2-3 등 후속 챕터가 내부 링크로 참조할 기초 개념(주식·주주·시세차익·배당)

- [ ] **Step 1: 템플릿 기반으로 본문 집필**

frontmatter: part 1, order 1, keywords 예: `["주식이란", "주식 기초", "주주", "주식 투자 시작"]`

본문 아웃라인 (이 구성을 따르되 문장은 집필 시 작성):
- 핵심 답변: 주식 = 회사 소유권의 조각. 주식을 산다 = 그 회사의 주인 중 한 명이 된다
- 섹션 1 "회사는 왜 주식을 발행하나": 자금 조달 관점. mermaid flowchart 필수 — 실제 자금 흐름 방향을 지키며 `회사 --주식 발행--> 투자자`, `투자자 --투자금--> 회사`, `회사 --배당--> 투자자`를 표현할 것. 시세차익은 회사가 아니라 다른 투자자와의 매매에서 발생하므로 배당과 같은 화살표로 묶지 않는다
- 섹션 2 "주주가 되면 뭘 갖게 되나": 의결권, 배당받을 권리, 시세차익 기대. 배당은 [2-3](../part2-korea-market/2-3-dividend-basics.md) 링크
- 섹션 3 "주가는 왜 오르내리나": 수요·공급 한 문단 수준 (심화 금지)
- 예시 (필수): "치킨집을 1억에 차리며 1만 조각(주)으로 나누면 1주 = 1만원. 장사가 잘돼 회사 가치가 2억이 되면 1주 = 2만원" 식의 숫자 예시
- 한 줄 정리

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part1-basics/1-1-what-is-stock.md && grep -c 'mermaid' part1-basics/1-1-what-is-stock.md`
Expected: frontmatter `6`, mermaid `1` 이상. 이어서 본문을 처음부터 읽으며 위 "검증 체크리스트" 6항목을 직접 확인

- [ ] **Step 3: README 진행 현황 갱신 후 Commit**

```bash
git add part1-basics/1-1-what-is-stock.md README.md
git commit -m "feat: 1-1 주식이란 무엇인가 집필"
```

---

### Task 5: 챕터 1-2 집필 — 증권계좌 개설, 어디서 어떻게 하나

**Files:**
- Create: `part1-basics/1-2-open-brokerage-account.md`
- Modify: `README.md` (체크박스 갱신)

**Interfaces:**
- Consumes: 템플릿, README 파일명
- Produces: 1-3(주문), 4-4/4-5(연금·ISA 계좌 종류)가 전제하는 "계좌가 있다"는 상태

- [ ] **Step 1: 본문 집필**

frontmatter: part 1, order 2, keywords 예: `["증권계좌 개설", "주식 계좌 만들기", "비대면 계좌개설", "증권사 선택"]`

아웃라인:
- 핵심 답변: 증권사 앱에서 비대면으로 10분이면 개설 가능. 준비물은 신분증과 본인 명의 은행계좌
- 섹션 1 "증권사 고르는 기준": 수수료, 앱 편의성, 이벤트. 특정 증권사 추천은 하지 않고 기준만 제시 (광고 심사·중립성 고려)
- 섹션 2 "비대면 개설 절차": mermaid flowchart 필수 — `앱 설치 → 신분증 촬영 → 본인 인증 → 계좌 종류 선택 → 개설 완료`
- 섹션 3 "계좌 종류, 뭘로 만들까": 일반 위탁계좌 vs 절세계좌(연금저축·IRP·ISA)가 있다는 소개만 하고 상세는 [4-4](../part4-etf-pension/4-4-pension-fund-vs-irp.md), [4-5](../part4-etf-pension/4-5-isa-account.md) 링크
- 예시 (필수): "20일 규칙" — 한 증권사에서 계좌를 만들면 다른 금융사 계좌는 20영업일 뒤에 개설 가능하다는 실전 팁을 사례로
- 한 줄 정리

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part1-basics/1-2-open-brokerage-account.md && grep -c 'mermaid' part1-basics/1-2-open-brokerage-account.md`
Expected: frontmatter `6`, mermaid `1` 이상 + 체크리스트 6항목 직접 확인

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part1-basics/1-2-open-brokerage-account.md README.md
git commit -m "feat: 1-2 증권계좌 개설 집필"
```

---

### Task 6: 챕터 1-3 집필 — 주식 사는 법 (호가창·주문 유형)

**Files:**
- Create: `part1-basics/1-3-how-to-buy-stocks.md`
- Modify: `README.md` (체크박스 갱신)

**Interfaces:**
- Consumes: 1-2의 "계좌 개설" (한 줄 요약+링크로 전제 처리)
- Produces: 호가창·시장가·지정가 개념 (1-4, 2-6이 참조)

- [ ] **Step 1: 본문 집필**

frontmatter: part 1, order 3, keywords 예: `["주식 사는 법", "호가창 보는 법", "시장가 지정가", "주식 주문"]`

아웃라인:
- 도입: 계좌 개설은 [1-2](1-2-open-brokerage-account.md) 참고 (규칙 2 적용)
- 핵심 답변: 종목 검색 → 호가창 확인 → 수량·가격 입력 → 매수 주문
- 섹션 1 "호가창 읽는 법": 매도호가/매수호가 구조를 **마크다운 표로 시각화 필수** (가격 세로축, 매도잔량/매수잔량 좌우 배치, 실제 숫자 사용)
- 섹션 2 "시장가 vs 지정가": 각각 언제 쓰는지. 표(비교표) 필수
- 섹션 3 "체결의 원칙": 가격 우선·시간 우선을 초보 수준으로만
- 예시 (필수): "삼성전자를 7만원에 10주 지정가 주문 → 호가가 70,100원이면 체결 안 됨, 70,000원 이하로 내려와야 체결" 식의 시나리오
- 한 줄 정리

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part1-basics/1-3-how-to-buy-stocks.md`
Expected: `6` + 호가창 표·비교표 포함 여부와 체크리스트 6항목 직접 확인

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part1-basics/1-3-how-to-buy-stocks.md README.md
git commit -m "feat: 1-3 주식 사는 법 집필"
```

---

### Task 7: 챕터 1-4 집필 — 매매 시간과 장전·장후 거래

**Files:**
- Create: `part1-basics/1-4-trading-hours.md`
- Modify: `README.md` (체크박스 갱신)

**Interfaces:**
- Consumes: 1-3의 주문 개념 (요약+링크)
- Produces: 정규장·시간외 개념 (3-2 미국 거래 시간이 대비 참조)

- [ ] **Step 1: 본문 집필**

frontmatter: part 1, order 4, keywords 예: `["주식 매매 시간", "장전 시간외", "장후 시간외", "동시호가"]`

아웃라인:
- 핵심 답변: 정규장은 평일 9:00~15:30. 그 전후로 시간외 거래가 있다
- 섹션 1 "하루 거래 시간표": **표 필수** — 장전 시간외(8:30~8:40), 장 시작 동시호가(8:30~9:00), 정규장(9:00~15:30), 장 마감 동시호가(15:20~15:30), 장후 시간외(15:40~16:00), 시간외 단일가(16:00~18:00) ※ 집필 시 현행 시간 확인
- 섹션 2 "동시호가란": 왜 시가·종가를 이렇게 정하는지 초보 수준 설명
- 섹션 3 "시간외 거래는 언제 쓰나": 장 중 매매 못 하는 직장인 사례. 시간외단일가는 지정가 전용(종가 ±10%, 시장가 주문 불가)이라는 규칙을 1차 출처 확인 후 포함
- 섹션 4 "거래소가 하나가 아니다 — 넥스트레이드(NXT)": 대체거래소 출범으로 국내 주식 거래 시간대와 호가창이 KRX/NXT로 이원화된 점. 프리마켓·애프터마켓 시간대와, 초보가 실제로 겪는 차이(주문 시 거래소 선택, SOR 자동 라우팅)를 초보 수준으로만. 이 섹션은 집필 시 웹 리서치로 현행 운영 시간을 반드시 확인할 것
- 예시 (필수): "15:35에 주문 내면 어떻게 되나" 시나리오
- 한 줄 정리. 미국 거래 시간은 [3-2](../part3-us-overseas/3-2-us-trading-hours.md) 링크
- 용어 정합성: 1-3에서 동시호가를 "단일가매매 중 가격이 상·하한가로 정해지는 특수한 경우"로 정의했으므로 이와 충돌하지 않게 쓸 것

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part1-basics/1-4-trading-hours.md`
Expected: `6` + 시간표 표 포함 여부와 체크리스트 6항목 직접 확인

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part1-basics/1-4-trading-hours.md README.md
git commit -m "feat: 1-4 매매 시간 집필"
```

---

### Task 8: 챕터 1-5 집필 — 수수료와 세금

**Files:**
- Create: `part1-basics/1-5-fees-and-taxes.md`
- Modify: `README.md` (체크박스 갱신)

**Interfaces:**
- Consumes: 1-3의 매수·매도 개념
- Produces: 증권거래세·배당소득세 기초 (3-3 미국주식 세금이 대비 참조)

- [ ] **Step 1: 본문 집필**

frontmatter: part 1, order 5, keywords 예: `["주식 수수료", "증권거래세", "주식 세금", "배당소득세"]`

아웃라인:
- 핵심 답변: 낼 것은 3가지 — 증권사 수수료(매수·매도 시), 증권거래세(매도 시), 배당소득세(배당받을 때)
- 섹션 1 "비용 한눈에 보기": **표 필수** — 항목/언제 내나/얼마나(집필 시점 세율 명시, "세율은 변동될 수 있음" 문구 포함)
- 섹션 2 "국내주식 양도소득세는?": 소액주주는 비과세라는 점, 대주주 요건은 존재만 언급 (심화 금지)
- 예시 (필수): "100만원어치 사서 110만원에 판 경우" 실제 수수료·세금 계산 예시 (수수료율 가정 명시)
- 한 줄 정리. 미국주식 세금은 [3-3](../part3-us-overseas/3-3-us-stock-tax.md) 링크

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part1-basics/1-5-fees-and-taxes.md`
Expected: `6` + 비용 표·계산 예시 포함 여부와 체크리스트 6항목 직접 확인

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part1-basics/1-5-fees-and-taxes.md README.md
git commit -m "feat: 1-5 수수료와 세금 집필"
```

---

### Task 9: 챕터 1-6 집필 — 시가총액·주가·거래량, 숫자 읽는 법

**Files:**
- Create: `part1-basics/1-6-market-cap-price-volume.md`
- Modify: `README.md` (체크박스 갱신)

**Interfaces:**
- Consumes: 1-1의 주식 개념 (요약+링크)
- Produces: 시가총액 개념 (2-2 지수 계산, 5-2 PER이 참조)

- [ ] **Step 1: 본문 집필**

frontmatter: part 1, order 6, keywords 예: `["시가총액이란", "시가총액 계산", "거래량 의미", "주가 보는 법"]`

아웃라인:
- 핵심 답변: 주가는 1주 가격일 뿐, 회사 크기는 시가총액(주가 × 발행주식수)으로 본다
- 섹션 1 "주가가 싸다고 싼 회사가 아니다": 흔한 초보 오해 교정
- 섹션 2 "시가총액 계산": mermaid 또는 수식 블록 필수 — `시가총액 = 주가 × 발행주식수`
- 섹션 3 "거래량과 거래대금": 거래량이 말해주는 것 (관심도·유동성) 초보 수준
- 예시 (필수): 실제 두 회사 비교 — "A사 주가 5만원 × 60억 주 = 시총 300조 vs B사 주가 100만원 × 1천만 주 = 시총 10조. 주가는 B가 20배지만 회사 크기는 A가 30배" (가상의 숫자 명시 가능)
- 한 줄 정리. PER 등 가치평가는 [5-2](../part5-analysis/5-2-per.md) 링크

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part1-basics/1-6-market-cap-price-volume.md`
Expected: `6` + 계산 시각화·비교 예시 포함 여부와 체크리스트 6항목 직접 확인

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part1-basics/1-6-market-cap-price-volume.md README.md
git commit -m "feat: 1-6 시가총액·주가·거래량 집필"
```

---

### Task 10: 파트 1 마무리 검수

**Files:**
- Modify: 파트 1 챕터 6개 (검수에서 발견된 수정만)

**Interfaces:**
- Consumes: Task 4~9의 챕터 6개
- Produces: 파트 1 완성본. 후속 계획(파트 2)의 출발점

- [ ] **Step 1: 내부 링크 깨짐 검사**

```bash
cd /Users/yshyuk/Documents/Repository/stock-wiki
# 파트 1 챕터 6개 파일이 README 슬러그대로 존재하는지 확인
for f in 1-1-what-is-stock 1-2-open-brokerage-account 1-3-how-to-buy-stocks 1-4-trading-hours 1-5-fees-and-taxes 1-6-market-cap-price-volume; do
  [ -f "part1-basics/$f.md" ] && echo "OK $f" || echo "MISSING $f"
done
```

Expected: `OK` 6줄. 챕터 본문 내 상대 링크 중 아직 미집필 파트(2~5) 링크는 파일이 없어 깨진 상태가 정상 — 대상 파일명이 README 슬러그 표와 일치하는지만 눈으로 확인

- [ ] **Step 2: 톤·중복 통독 검수**

파트 1 전체(6개)를 이어서 통독하며: 말투 통일(합쇼체/해요체 중 하나), 같은 설명의 과도한 중복, 챕터 간 난이도 역전이 없는지 확인. 발견 시 수정

- [ ] **Step 3: README 파트 1 체크박스 6개가 모두 [x]인지 확인 후 Commit**

Run: `grep -c '\- \[x\]' README.md`
Expected: `6`

```bash
git add -A && git commit -m "docs: 파트 1 검수 완료"
```
