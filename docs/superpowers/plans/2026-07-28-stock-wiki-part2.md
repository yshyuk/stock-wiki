# 파트 2 (국내 주식시장 이해하기) 집필 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파트 2 「국내 주식시장 이해하기」 7개 챕터를 집필하고, 파트 1에서 이월된 개선 백로그 중 파트 2와 맞물리는 항목을 함께 정리한다.

**Architecture:** 파트 1과 동일한 하이브리드 구조 — 각 챕터는 검색 질문 하나에 완결로 답하는 독립 글이면서, 순서대로 읽으면 책이 된다. 마크다운 + YAML frontmatter, 시각화는 mermaid와 마크다운 표.

**Tech Stack:** Markdown, mermaid, git. 빌드 도구 없음(사이트 구축은 파트 2 이후 별도 프로젝트).

## Global Constraints

설계 문서 `docs/superpowers/specs/2026-07-27-stock-wiki-design.md`와 파트 1에서 확립된 규칙. 모든 태스크에 적용:

1. 각 챕터는 하나의 검색 질문에 완결로 답한다. 검색으로 도착한 독자가 다른 글을 안 읽어도 만족해야 한다.
2. 앞 챕터 지식이 필요하면 **한두 줄 요약 + 내부 링크를 한 문장 안에** 넣는다. 요약 없는 회상("~에서 봤어요")은 금지 — 파트 1에서 이 문제로 1-5 도입부를 재작성했다.
3. 초보 눈높이의 구체적 예시를 챕터당 최소 1개, 실제 숫자를 넣어 포함한다.
4. 시의성 있는 사실(제도·수치·일정)에는 "2026년 7월 기준" 같은 as-of 표기를 붙인다. 개념 정의에는 붙이지 않는다.
5. 파일명은 `챕터번호-영문슬러그.md`, README 슬러그 표와 정확히 일치해야 한다.
6. 시각화(mermaid 또는 마크다운 표)를 적극 사용한다. mermaid 라벨에는 괄호·따옴표·슬래시·화살표를 넣지 않는다(파싱 깨짐).
7. 대상 독자는 완전 초보~입문자. **모든 용어를 각 챕터에서 첫 등장 시 설명**한다. 파트 1의 여섯 챕터 리뷰에서 전부 최다 지적된 항목이다.
8. 중급 이상 심화 금지. 파생상품, 기술적 분석, 차트 패턴, 정량 모델은 파트 2 범위 밖이다.
9. **증권사 실명을 쓰거나 순위를 매기지 않는다.** 광고를 붙일 콘텐츠라 벤더 중립성이 중요하다. 거래소·협회·정부기관(한국거래소/KRX, 넥스트레이드/NXT, 금융투자협회, 금융위원회, 예탁결제원)은 인프라이므로 실명 사용 가능.
10. 실존기업에 지어낸 수치를 붙이지 않는다. 가상 기업(A전자, B사 등)을 쓴다.
11. 톤은 해요체. 파트 1 여섯 챕터와 동일한 목소리.
12. 마크다운 위생: `)**한글` 패턴은 CommonMark에서 볼드를 닫지 못해 별표가 노출된다. 커밋 전 검사할 것.

## 파트 1에서 확정된 용어 정의 (충돌 금지)

파트 1에서 이미 정의를 확정한 용어들이다. 파트 2에서 다시 쓸 때 **다르게 정의하면 안 된다**. 파트 1에서 이 유형의 충돌이 세 번 발생했다.

| 용어 | 확정된 정의 | 정의된 곳 |
|---|---|---|
| 주가 | 회사 가치 ÷ 주식 수가 아니다. 그 값은 기준점일 뿐이고, 기대가 얹혀 사겠다는 사람과 팔겠다는 사람 사이에서 정해지는 가격 | 1-1 |
| 발행시장 vs 유통시장 | 회사 통장에 돈이 들어가는 건 주식을 새로 발행해 팔 때뿐. 앱에서 사는 건 이미 발행된 주식을 다른 투자자에게서 넘겨받는 것 | 1-1 |
| 배당 | 그해 이익이 아니라 **그동안 쌓아온 이익 가운데 일부**를 주주에게 나눠주는 것. 흑자여도 안 줄 수 있고 적자여도 줄 수 있다 | 1-1 |
| 유한책임 | 주주의 손실은 투자한 금액까지로 제한된다 | 1-1 |
| 단일가매매 | 일정 시간 주문을 모아 하나의 가격으로 체결하는 방식 | 1-3, 1-4 |
| 동시호가 | 단일가매매의 **부분집합** — 가격이 상한가나 하한가로 정해져 시간우선원칙이 배제되는 특수한 경우. "주문을 모아 한 가격에 체결하는 시간대 = 동시호가"는 틀린 서술 | 1-3, 1-4 |
| 동시호가 배분 내부 순서 | **단정하지 않는다.** 1차 출처 확보 실패로 1-3·1-4 모두 "접수 시간의 앞뒤를 따지지 않고 다른 기준으로 나눈다"까지만 서술 (아래 Task 7 참조) | 1-3, 1-4 |
| 발행주식수 / 상장주식수 | 지금 시장에 나와 있는 그 회사 주식의 총 개수. 상장 시점 고정값이 아니며 증자·액면분할·소각으로 변한다 | 1-1, 1-6 |
| 시가총액 | 주가 × 발행주식수. 확정된 실제 가치가 아니라 시장이 지금 이 순간 매긴 값 | 1-6 |
| 거래량 / 거래대금 | 거래량은 체결된 주식 수(같은 주식이 여러 번 체결되면 중복 계상), 거래대금은 그 금액 | 1-6 |
| 대주주 | 그 회사 주식을 아주 많이 가진 주주. 기준은 종목당 50억원(2026년 7월 기준) | 1-5, 1-6 |

## 챕터 frontmatter 규격 (파트 1과 동일)

```yaml
---
title: "챕터 제목 (검색 질문형)"
description: "검색 결과에 노출될 1~2문장 요약"
keywords: ["핵심 검색어1", "검색어2", "검색어3"]
part: 2
order: 1
date: 2026-07-28
---
```

## 검증 체크리스트 (모든 챕터 태스크 공통)

- [ ] frontmatter 6개 필드(title/description/keywords/part/order/date), part는 2, order는 챕터 번호
- [ ] 글만 읽고 제목의 질문에 답이 완결된다
- [ ] 실제 숫자가 들어간 구체적 예시가 1개 이상 있다
- [ ] 태스크에 명시된 시각화(mermaid 또는 표)가 포함되어 있다
- [ ] 위 「파트 1에서 확정된 용어 정의」와 충돌하지 않는다
- [ ] 증권사 실명 0건, 실존기업에 붙인 지어낸 수치 0건
- [ ] 시의성 있는 수치에 as-of 표기가 있다
- [ ] `grep -nE '\)\*\*[가-힣]'` 히트 0건, 모든 줄의 `**` 개수가 짝수
- [ ] 중급 이상 심화 내용이 없다

## 파일 구조

```
docs/chapter-template.md        # Task 1에서 투자 권유 아님 고지 추가
part2-korea-market/
├── 2-1-kospi-vs-kosdaq.md
├── 2-2-how-kospi-index-works.md
├── 2-3-dividend-basics.md
├── 2-4-ipo-subscription.md
├── 2-5-capital-increase-and-split.md
├── 2-6-price-limit-circuit-breaker.md
└── 2-7-short-selling.md
README.md                       # 챕터마다 체크박스 갱신
docs/handoffs.md                # Task 9에서 갱신
part1-basics/1-5-fees-and-taxes.md   # Task 9에서 2-1 링크 추가
part1-basics/1-6-market-cap-price-volume.md  # Task 9에서 벤더 언급 정리
```

---

### Task 1: 챕터 템플릿에 투자 권유 아님 고지 추가

**Files:**
- Modify: `docs/chapter-template.md`

**Interfaces:**
- Consumes: 없음
- Produces: 이후 모든 챕터가 상속받는 고지 문구. Task 2~8이 이 템플릿을 복사해 시작한다

파트 1 최종 리뷰의 백로그 항목이다. 광고를 붙일 금융 콘텐츠인데 "이 글은 투자 권유가 아닙니다" 성격의 고지가 챕터·README·템플릿 어디에도 없다. 챕터마다 넣는 대신 템플릿에 넣어 이후 챕터가 상속받게 한다.

- [ ] **Step 1: 템플릿 맨 아래에 고지 블록 추가**

`docs/chapter-template.md`의 "한 줄 정리" 섹션 다음, 관련 챕터 링크 주석 앞에 아래를 넣는다. 문구는 그대로 쓴다.

```markdown
---

> 이 글은 투자 판단에 도움이 되는 일반적인 정보를 제공할 뿐, 특정 종목이나 상품의 매매를 권유하지 않아요. 제도와 세금은 바뀔 수 있으니 실제 투자 전에는 최신 내용을 다시 확인하세요.
```

- [ ] **Step 2: 템플릿이 여전히 frontmatter 6필드를 갖는지 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' docs/chapter-template.md`
Expected: `6`

- [ ] **Step 3: Commit**

```bash
git add docs/chapter-template.md
git commit -m "docs: 챕터 템플릿에 투자 권유 아님 고지 추가"
```

---

### Task 2: 챕터 2-1 집필 — 코스피 vs 코스닥, 뭐가 다른가

**Files:**
- Create: `part2-korea-market/2-1-kospi-vs-kosdaq.md`
- Modify: `README.md` (2-1 체크박스)

**Interfaces:**
- Consumes: Task 1의 템플릿(고지 포함)
- Produces: 코스피·코스닥 정의. 파트 1의 1-5가 이 챕터로 링크할 예정(Task 9)이고, 2-2·2-6·2-7이 전제로 삼는다

**집필 전 웹 검증 필수:** 두 시장의 현행 상장 요건 개요, 시장 규모(종목 수 등), 코넥스와의 관계. 상장 요건은 자주 바뀌므로 세부 수치를 나열하지 말고 성격 차이 위주로 쓰되, 쓰는 수치는 반드시 출처를 확인한다.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 1, keywords 예: `["코스피 코스닥 차이", "코스피란", "코스닥이란", "코넥스"]`

아웃라인:
- 핵심 답변: 둘 다 한국거래소가 여는 시장이고 주식을 사고파는 방법도 같다. 다른 건 어떤 회사가 올라오느냐다
- 섹션 1 "무엇이 다른가": 코스피는 규모가 크고 업력이 긴 회사 중심, 코스닥은 기술·성장 기업 중심. **비교표 필수** (성격 / 대표적인 기업 유형 / 상장 요건의 문턱 / 변동성 경향). 상장 요건은 "문턱이 다르다" 수준으로만
- 섹션 2 "코넥스는 뭔가": 중소·벤처기업 전용 시장이라는 한 문단. 1-5에서 코넥스가 거래세 표에 등장하므로 여기서 정식으로 받아준다
- 섹션 3 "초보에게 실질적으로 뭐가 다른가": 거래 방법·시간은 같고([1-3](../part1-basics/1-3-how-to-buy-stocks.md), [1-4](../part1-basics/1-4-trading-hours.md) 링크), 증권거래세율도 현재 같다([1-5](../part1-basics/1-5-fees-and-taxes.md) 링크). 실제 차이는 변동성과 종목 성격
- 예시 (필수): 같은 100만원을 코스피 종목과 코스닥 종목에 넣었을 때 하루 변동 폭이 어떻게 다를 수 있는지를 가상 숫자로
- 한 줄 정리. 지수 계산은 [2-2](2-2-how-kospi-index-works.md) 링크

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-1-kospi-vs-kosdaq.md`
Expected: `6` + 비교표 존재 + 공통 체크리스트 9항목 직접 확인

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-1-kospi-vs-kosdaq.md README.md
git commit -m "feat: 2-1 코스피 vs 코스닥 집필"
```

---

### Task 3: 챕터 2-2 집필 — 코스피 지수는 어떻게 계산되나

**Files:**
- Create: `part2-korea-market/2-2-how-kospi-index-works.md`
- Modify: `README.md` (2-2 체크박스)

**Interfaces:**
- Consumes: 2-1의 코스피 정의, 1-6의 시가총액 정의(주가 × 발행주식수, 시장이 매긴 값)
- Produces: 지수 개념. 3-5(미국 3대 지수)가 대비 참조한다

**집필 전 웹 검증 필수:** 코스피 지수의 기준시점(1980-01-04)과 기준지수(100), 시가총액 가중 방식, 산출 주체. 1차 출처는 한국거래소.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 2, keywords 예: `["코스피 지수 계산", "코스피 지수란", "시가총액 가중", "코스피 3000 의미"]`

아웃라인:
- 핵심 답변: 코스피 지수는 시장 전체의 시가총액이 기준시점보다 몇 배가 됐는지를 보여주는 숫자다
- 섹션 1 "지수는 무엇을 재는가": 기준시점 시가총액을 100으로 놓고 지금이 몇 배인지. **수식 블록 또는 mermaid 필수** — `지수 = (오늘 시가총액 ÷ 기준시점 시가총액) × 100`. 시가총액 정의는 [1-6](../part1-basics/1-6-market-cap-price-volume.md) 링크
- 섹션 2 "그래서 지수 숫자가 무슨 뜻인가": 기준시점 대비 몇 배인지를 초보 언어로. **단, "지수 2,500 = 시장 전체 시가총액이 25배가 됐다"는 틀린 서술이다.** 유·무상증자·주식배당·합병·신규상장이 있으면 기준시가총액과 비교시가총액을 함께 수정하므로, 지수는 **주가 흐름의 배율**이지 시장 몸값이 실제로 몇 배가 됐는지가 아니다. 이 점을 한두 문장으로 반드시 짚을 것. 지수 레벨은 반드시 가정형("지수가 2,500이라면")으로만 쓰고 현재값처럼 제시하지 않는다
- 섹션 3 "시가총액 가중이라 생기는 일": 큰 회사가 지수를 좌우한다. "지수는 올랐는데 내 종목은 내렸다"가 왜 생기는지
- 예시 (필수): 세 종목짜리 가상 시장을 만들어 지수를 직접 계산. 큰 종목만 오른 경우와 작은 종목만 오른 경우의 지수 차이를 숫자로 대비
- 한 줄 정리. 미국 지수는 [3-5](../part3-us-overseas/3-5-us-indices.md) 링크

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-2-how-kospi-index-works.md`
Expected: `6` + 계산 시각화 존재 + 예시의 산술 자체 검산 + 공통 체크리스트 9항목

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-2-how-kospi-index-works.md README.md
git commit -m "feat: 2-2 코스피 지수 계산 집필"
```

---

### Task 4: 챕터 2-3 집필 — 배당이란 (배당락·배당 기준일·배당수익률)

**Files:**
- Create: `part2-korea-market/2-3-dividend-basics.md`
- Modify: `README.md` (2-3 체크박스)

**Interfaces:**
- Consumes: 1-1의 배당 정의(그해 이익이 아니라 쌓아온 이익 중 일부), 1-5의 배당소득세 15.4%
- Produces: 배당 상세. 1-1과 1-5가 이 챕터로 링크하고 있다. 3-6(미국 배당주)이 대비 참조한다

**집필 전 웹 검증 필수:** 배당기준일·배당락일의 현행 관계(결제 주기 T+2 기준으로 언제까지 사야 배당을 받는지), 그리고 **배당 절차 개선 제도** — 최근 배당액을 먼저 정하고 기준일을 나중에 두는 방향으로 제도가 바뀌었으므로 현행이 무엇인지 1차 출처(금융위원회·한국거래소)로 확인할 것. 옛 관행을 현재형으로 쓰면 오류가 된다.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 3, keywords 예: `["배당금 받는 법", "배당기준일", "배당락", "배당수익률"]`

아웃라인:
- 핵심 답변: 배당을 받으려면 배당기준일에 주주명부에 올라 있어야 하고, 결제 주기 때문에 그보다 며칠 앞서 사야 한다
- 섹션 1 "언제까지 사야 받나": **타임라인 표 또는 mermaid 필수** — 매수일 → 결제일(T+2) → 배당기준일 → 배당락일 → 배당금 입금. 실제 날짜를 넣은 예시로
- 섹션 2 "배당락이 뭔가": 배당받을 권리가 사라진 다음 날 주가가 배당금만큼 조정되는 경향. "배당 받고 바로 팔면 공짜 아닌가"라는 초보의 흔한 오해를 정면으로 다룰 것
- 섹션 3 "배당수익률 읽는 법": 배당금 ÷ 주가. 과거 배당 기준이라 미래를 보장하지 않는다는 점, 주가가 떨어져도 수익률이 올라간다는 함정
- 섹션 4 "세금": 15.4% 원천징수라는 사실만 한 줄, 상세는 [1-5](../part1-basics/1-5-fees-and-taxes.md) 링크
- 예시 (필수): 주가 5만원·배당금 2,000원인 가상 종목으로 배당수익률 4% 계산과 배당락 시나리오
- 한 줄 정리. 미국 배당주는 [3-6](../part3-us-overseas/3-6-us-dividend-investing.md) 링크

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-3-dividend-basics.md`
Expected: `6` + 타임라인 시각화 존재 + 배당수익률 산술 검산 + 공통 체크리스트 9항목

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-3-dividend-basics.md README.md
git commit -m "feat: 2-3 배당 기초 집필"
```

---

### Task 5: 챕터 2-4 집필 — 공모주 청약, 어떻게 참여하나

**Files:**
- Create: `part2-korea-market/2-4-ipo-subscription.md`
- Modify: `README.md` (2-4 체크박스)

**Interfaces:**
- Consumes: 1-1의 발행시장 vs 유통시장 구분, 1-2의 계좌 개설
- Produces: 공모주 개념. 2-5(증자)가 인접 주제로 참조한다

**집필 전 웹 검증 필수:** 현행 공모주 배정 방식 — 균등배정과 비례배정의 비율, 중복청약 허용 여부, 청약증거금 비율, 의무보유확약. 이 영역은 제도 변경이 잦으므로 반드시 현행을 확인하고 as-of 표기를 붙일 것. 1차 출처는 금융위원회·금융투자협회.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 4, keywords 예: `["공모주 청약 방법", "균등배정", "비례배정", "청약증거금"]`

아웃라인:
- 도입: 공모주는 회사가 주식을 **새로 발행해** 처음 파는 것이라 [1-1](../part1-basics/1-1-what-is-stock.md)에서 말한 발행시장에 해당한다. 이 돈은 회사로 간다
- 핵심 답변: 주관 증권사 계좌를 만들고, 청약 기간에 증거금을 넣고 신청하면 배정 후 남은 돈이 환불된다
- 섹션 1 "청약 절차": **mermaid flowchart 필수** — 수요예측으로 공모가 결정 → 청약 기간 → 배정 → 환불 → 상장. 각 단계가 며칠 간격인지 포함
- 섹션 2 "균등배정과 비례배정": 소액 투자자도 최소 수량을 받을 수 있게 한 균등배정과, 증거금 규모에 비례하는 비례배정의 차이. **비교표 권장**
- 섹션 3 "주의할 점": 공모가가 항상 싼 게 아니라는 것, 상장 첫날 변동성, 의무보유확약 물량이 풀릴 때. 특정 종목 추천으로 읽히지 않게 쓸 것
- 예시 (필수): 균등배정 경쟁률을 가정해 "증거금 얼마를 넣으면 몇 주를 받고 얼마가 환불되는지" 계산
- 한 줄 정리. 증권사 선택 기준은 [1-2](../part1-basics/1-2-open-brokerage-account.md) 링크 (실명 언급 금지)

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-4-ipo-subscription.md && grep -c 'mermaid' part2-korea-market/2-4-ipo-subscription.md`
Expected: frontmatter `6`, mermaid `1` 이상 + 증거금 계산 검산 + 공통 체크리스트 9항목

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-4-ipo-subscription.md README.md
git commit -m "feat: 2-4 공모주 청약 집필"
```

---

### Task 6: 챕터 2-5 집필 — 유상증자·무상증자·액면분할이 주가에 미치는 영향

**Files:**
- Create: `part2-korea-market/2-5-capital-increase-and-split.md`
- Modify: `README.md` (2-5 체크박스)

**Interfaces:**
- Consumes: 1-6의 발행주식수 정의(증자·액면분할·소각으로 변한다), 1-6의 시가총액 정의, 1-1의 발행시장 구분
- Produces: 증자·분할 개념

**집필 전 웹 검증 필수:** 유상증자의 방식 구분(주주배정·제3자배정·일반공모)과 각각이 기존 주주에게 갖는 의미, 권리락의 정의. 무상증자·액면분할이 이론상 시가총액 중립이라는 점의 근거.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 5, keywords 예: `["유상증자 주가", "무상증자란", "액면분할 효과", "권리락"]`

아웃라인:
- 핵심 답변: 셋 다 주식 수를 늘리지만 회사에 돈이 들어오는지가 다르고, 그래서 주주에게 미치는 영향도 다르다
- 섹션 1 "세 가지 한눈에 보기": **비교표 필수** (주식 수 / 회사에 들어오는 돈 / 기존 주주 지분율 / 이론상 시가총액 / 흔히 시장이 보이는 반응). 1-6에서 "액면분할해도 시가총액은 그대로"라고 이미 말했으므로 그와 정합하게
- 섹션 2 "유상증자가 왜 악재로 읽히나": 새 주식을 팔아 돈을 받으니 기존 주주 지분이 희석된다. 다만 그 돈을 어디에 쓰는지에 따라 다르게 볼 수 있다는 점까지. 방식 구분(주주배정·제3자배정 등)은 이름과 한 줄 설명까지만
- 섹션 3 "무상증자와 액면분할은 왜 다른가": 둘 다 공짜로 주식이 늘지만 회계상 출처가 다르다. 초보 수준으로만
- 섹션 4 "권리락": 증자 권리가 사라지며 기준가가 조정되는 것. [2-3](2-3-dividend-basics.md)의 배당락과 같은 원리라는 점을 연결
- 예시 (필수): 1주 5만원 × 100만주 회사가 무상증자 1:1을 하면 2만주가 아니라 200만주가 되고 이론 주가는 2.5만원, 시가총액은 500억으로 동일하다는 식의 검산 가능한 계산
- 한 줄 정리

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-5-capital-increase-and-split.md`
Expected: `6` + 비교표 존재 + 예시 산술 검산 + 1-6과의 정합성 + 공통 체크리스트 9항목

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-5-capital-increase-and-split.md README.md
git commit -m "feat: 2-5 증자·액면분할 집필"
```

---

### Task 7: 챕터 2-6 집필 — 상한가·하한가·서킷브레이커

**Files:**
- Create: `part2-korea-market/2-6-price-limit-circuit-breaker.md`
- Modify: `README.md` (2-6 체크박스)

**Interfaces:**
- Consumes: 1-3·1-4의 단일가매매/동시호가 정의, 1-4의 매매 시간표
- Produces: 가격제한·매매중단 개념

**이 태스크에는 미해결 인수인계가 걸려 있다. 반드시 `docs/handoffs.md` 1번 항목을 먼저 읽을 것.**

동시호가 배분의 내부 순서(위탁매매우선이 수량우선에 앞서는지)는 파트 1에서 1차 출처 확보에 실패해 **1-3·1-4 모두 단정을 피한 상태**다. 이 챕터에서 단정하려면 유가증권시장 업무규정 시행세칙 제34조 원문을 먼저 확보해야 한다(공개 웹 경로는 막혀 있으므로 KRX 규정집 PDF 등 다른 경로 시도). 확보하지 못하면 **파트 1과 같은 수위로 헤지하고, 그 사실을 리포트에 명시**한다. 새로 단정하면 세 챕터가 어긋난다.

**집필 전 웹 검증 필수:** 현행 가격제한폭(±30%가 맞는지, 코스피·코스닥 동일한지), 서킷브레이커 3단계 발동 요건과 각 단계의 중단 시간, 사이드카 발동 요건, 변동성완화장치(VI)의 종류와 발동 조건. 1차 출처는 한국거래소. **넥스트레이드(NXT) 종목에도 같은 규칙이 적용되는지 확인**할 것 — 1-4에서 이미 거래소 이원화를 다뤘으므로 독자가 궁금해할 지점이다.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 6, keywords 예: `["상한가 하한가", "서킷브레이커", "사이드카", "VI 발동"]`

아웃라인:
- 핵심 답변: 하루에 주가가 움직일 수 있는 폭에 한계를 두고, 시장 전체가 급락하면 아예 거래를 멈춘다
- 섹션 1 "가격제한폭": 전날 종가 기준 ±30%(검증 후 확정). 상한가·하한가라는 말의 뜻
- 섹션 2 "시장 전체를 멈추는 장치": 서킷브레이커 단계별 요건과 중단 시간, 사이드카. **표 필수**, as-of 표기 필수
- 섹션 3 "개별 종목을 잠깐 멈추는 장치(VI)": 변동성완화장치를 초보 언어로. 앱에서 "VI 발동"을 봤을 때 무슨 일인지
- 섹션 4 "멈춘 뒤 다시 열릴 때": 단일가매매로 재개된다는 점. [1-4](../part1-basics/1-4-trading-hours.md)의 단일가매매 정의와 정합하게 쓰고, **동시호가 배분 내부 순서는 위 인수인계 지침을 따를 것**
- 예시 (필수): 전날 종가 1만원인 가상 종목의 상한가·하한가를 계산하고, VI가 발동되는 시나리오
- 한 줄 정리

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-6-price-limit-circuit-breaker.md`
Expected: `6` + 표 존재 + 상한가 계산 검산 + **1-3·1-4의 동시호가 서술과 충돌 없음** + 공통 체크리스트 9항목

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-6-price-limit-circuit-breaker.md README.md
git commit -m "feat: 2-6 상한가·하한가·서킷브레이커 집필"
```

---

### Task 8: 챕터 2-7 집필 — 공매도란 무엇이고 왜 논란인가

**Files:**
- Create: `part2-korea-market/2-7-short-selling.md`
- Modify: `README.md` (2-7 체크박스)

**Interfaces:**
- Consumes: 1-1의 주식 소유 개념, 1-3의 매도 주문
- Produces: 공매도 개념. 파트 2의 마지막 챕터

**이 챕터는 정치적으로 민감하다.** 공매도 제도는 한국에서 개인 투자자와 기관 사이의 오랜 쟁점이고, 금지·재개가 반복돼 왔다. 다음을 지킬 것:
- **현행 상태를 1차 출처(금융위원회·한국거래소)로 반드시 확인**하고 as-of 표기를 붙인다. 금지 중인지 재개됐는지, 무차입공매도 규제와 전산화가 어떻게 되어 있는지가 자주 바뀐다.
- 찬반 어느 한쪽을 옹호하지 않는다. **양측 논거를 각각 사실로 서술**하고 판단은 독자에게 맡긴다. 광고를 붙일 교육 콘텐츠이므로 정치적 편향은 위험하다.
- 개인이 공매도를 하라거나 하지 말라는 권유로 읽히지 않게 한다.

- [ ] **Step 1: 본문 집필**

frontmatter: part 2, order 7, keywords 예: `["공매도란", "공매도 뜻", "무차입 공매도", "공매도 재개"]`

아웃라인:
- 핵심 답변: 없는 주식을 빌려서 먼저 팔고 나중에 사서 갚는 것. 주가가 내려야 이익이 난다
- 섹션 1 "어떻게 작동하나": **mermaid flowchart 필수** — 주식 빌림 → 매도 → 주가 하락 → 재매수 → 상환. 각 단계에서 돈이 어떻게 움직이는지
- 섹션 2 "차입공매도와 무차입공매도": 빌리고 파는 것과 빌리지도 않고 파는 것의 차이. 후자가 왜 문제인지
- 섹션 3 "왜 논란인가": 찬성 논거(가격 발견 기능, 유동성 공급)와 반대 논거(개인·기관 간 조건 차이, 불법 무차입 적발 사례)를 **각각 사실로** 서술. 어느 쪽도 옹호하지 않는다
- 섹션 4 "지금은 어떤 상태인가": 현행 제도를 as-of 표기와 함께. 제도가 자주 바뀌니 최신 확인을 권하는 문장 포함
- 예시 (필수): 1만원에 빌려 팔고 8천원에 되사 갚는 경우와, 반대로 1만 2천원으로 올라 손실이 나는 경우를 숫자로 대비. 손실이 이론상 무제한이라는 점을 이 예시로 보여줄 것
- 한 줄 정리

- [ ] **Step 2: 검증 체크리스트 통과 확인**

Run: `grep -c -E '^(title|description|keywords|part|order|date):' part2-korea-market/2-7-short-selling.md && grep -c 'mermaid' part2-korea-market/2-7-short-selling.md`
Expected: frontmatter `6`, mermaid `1` 이상 + 손익 계산 검산 + **찬반 균형 서술 확인** + 공통 체크리스트 9항목

- [ ] **Step 3: README 갱신 후 Commit**

```bash
git add part2-korea-market/2-7-short-selling.md README.md
git commit -m "feat: 2-7 공매도 집필"
```

---

### Task 9: 파트 2 검수 + 파트 1 백로그 반영

**Files:**
- Modify: 파트 2 챕터 7개 (검수에서 발견된 수정만)
- Modify: `part1-basics/1-5-fees-and-taxes.md` (2-1 링크 추가)
- Modify: `part1-basics/1-6-market-cap-price-volume.md` (벤더 언급 정리)
- Modify: `docs/handoffs.md` (해소된 항목 정리, 새 인수인계 추가)

**Interfaces:**
- Consumes: Task 2~8의 챕터 7개
- Produces: 파트 2 완성본. 사이트 구축 프로젝트의 출발점

- [ ] **Step 1: 파트 1 백로그 중 파트 2 완성으로 해소 가능한 항목 처리**

`docs/handoffs.md` 6번 백로그에서 아래를 반영한다:

1. **1-5의 코스피/코스닥 미정의 문제** — 1-5에서 코스피가 처음 나오는 지점에 한 절 설명을 넣고 `[2-1](../part2-korea-market/2-1-kospi-vs-kosdaq.md)` 링크를 건다. 특히 "(코스피에만 붙어요)"라는 농어촌특별세 설명이 코스피를 모르는 독자에게 무의미했던 문제를 해소한다.
2. **1-6의 네이버페이 증권 언급** — 한국거래소 정보데이터시스템과 나란히 놓인 상업 데이터 벤더라 빼도 독자 손해가 없다. 제거한다.
3. **실존기업/가상기업 혼용** — 1-1(2곳)과 1-4(1곳)의 삼성전자를 가상 기업으로 바꿀지 판단한다. 1-1의 경우 "우리가 아는 회사"라는 친숙함이 설명에 기여하므로, 수치가 붙지 않은 단순 언급이면 유지해도 된다. 판단 근거를 리포트에 남길 것.

- [ ] **Step 2: 파트 2 내부 링크·슬러그 검사**

```bash
cd /Users/yshyuk/Documents/Repository/stock-wiki
for f in 2-1-kospi-vs-kosdaq 2-2-how-kospi-index-works 2-3-dividend-basics 2-4-ipo-subscription 2-5-capital-increase-and-split 2-6-price-limit-circuit-breaker 2-7-short-selling; do
  [ -f "part2-korea-market/$f.md" ] && echo "OK $f" || echo "MISSING $f"
done
```

Expected: `OK` 7줄. 이어서 파트 1이 파트 2로 거는 링크(1-1→2-3, 1-4→2-6, 1-5→2-3 등)의 대상 파일이 이제 실제로 존재하는지 확인한다.

- [ ] **Step 3: 마크다운·다이어그램 위생 일괄 검사**

```bash
cd /Users/yshyuk/Documents/Repository/stock-wiki
grep -nE '\)\*\*[가-힣]' part1-basics/*.md part2-korea-market/*.md README.md docs/*.md || echo "볼드 패턴 OK"
for f in part1-basics/*.md part2-korea-market/*.md README.md; do
  awk -v F="$f" '{n=gsub(/\*\*/,"&"); if(n%2==1) print F":"NR}' "$f"
done
for f in part2-korea-market/2-*.md; do
  echo -n "$f: "; grep -cE '^(title|description|keywords|part|order|date):' "$f"
done
```

Expected: 볼드 패턴 0건, 홀수 라인 0건, frontmatter 전부 6

mermaid 블록은 라벨 내 괄호·따옴표·슬래시·화살표 부재를 정적 검사로 확인한다.

- [ ] **Step 4: 톤·중복·정합성 통독 검수**

파트 2 전체(7개)를 2-1부터 순서대로 통독하며 확인한다:
- 말투 통일(해요체), 파트 1과 같은 목소리인지
- 같은 설명의 과도한 중복
- 챕터 간 난이도 역전
- 「파트 1에서 확정된 용어 정의」와의 충돌. 특히 동시호가(2-6), 배당(2-3), 발행주식수·시가총액(2-5), 발행시장(2-4)
- 2-7의 공매도 서술이 찬반 어느 한쪽으로 기울지 않았는지

발견 시 수정한다.

- [ ] **Step 5: handoffs.md 갱신**

해소된 백로그 항목을 지우고, 파트 2에서 새로 생긴 인수인계(예: 2-6에서 시행세칙 원문을 확보했는지 여부, 2-7 공매도 제도의 재확인 시점, 파트 3 집필 시 주의점)를 추가한다. 사이트 구축 프로젝트로 넘길 사항이 있으면 별도 섹션으로 남긴다.

- [ ] **Step 6: README 파트 2 체크박스 7개 확인 후 Commit**

Run: `grep -c '\- \[x\]' README.md`
Expected: `13` (파트 1의 6개 + 파트 2의 7개)

```bash
git add -A && git commit -m "docs: 파트 2 검수 완료 및 파트 1 백로그 반영"
```
