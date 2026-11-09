# 사이트 품질 개선 감사 보고서 (2026-11-09)

> 사이트에 표시되지 않는 내부 문서예요. 계획서 1~5단계의 결과를 기록해요. 6단계(계산기)와 운영 배포는 범위 밖이에요.

## 1. 변경 요약

| 단계 | 결과 |
|---|---|
| 1. 오류 수정 | Mermaid 오류 원인 확정 및 수정, `3-3` 일정 도표를 표로 교체, 앵커 포함 내부 링크 테스트 추가 |
| 2. 출처 강화 | 핵심 8개 글에 「공식 출처」 절 추가, 조건·요약 불일치 정정, AI 사용 범위 고지 |
| 3. 탐색 | 홈에 읽기 순서·파트별 안내·주제 바로가기 추가, 글 끝에 정책 링크 추가 |
| 4. 애드센스 준비 | 개인정보처리방침을 실제 상태로 수정. 광고 코드는 켜지 않음 |
| 5. 측정 | `docs/measurement.md` 작성. 계정 수치는 미확인 |

## 2. Mermaid 오류 — 원인과 조치

- **증상:** `/part3-us-overseas/3-3-us-stock-tax`에 `Syntax error in text`가 보였다는 제보. 운영 사이트 직접 접속, SPA 이동, 다크 모드 전환으로는 재현되지 않았어요.
- **원인 1:** Mermaid는 기본값으로 window `load` 때 `.mermaid` 요소를 직접 렌더링해요. 이때 플러그인의 `startOnLoad: false` 적용 전이면 비어 있는 자리를 그리다 오류 화면을 만들어요. 도표 소스 문법과 무관한 경합이에요.
- **원인 2:** 차트 청크 로딩이나 그리기 실패도 Mermaid는 같은 `Syntax error in text` 화면으로 표시해요. 배포 직후 옛 해시 청크, 네트워크·차단기 환경이 해당돼요.
- **조치:** `theme/index.js`에서 `mermaid.startOnLoad = false`, `config.js`에 `suppressErrorRendering: true`. 단순 일정인 `3-3` 도표는 표로 교체.
- **검증:** 차트 청크 차단을 주입하면 수정 전에는 오류 화면, 수정 후에는 3회 모두 오류 화면과 잔여 요소가 없어요. 정상 조건에서는 남은 도표 11개가 전부 렌더링돼요.
- **한계:** 제보 당시 브라우저 환경을 재현한 것은 아니에요. 위 경로로 같은 메시지가 생기는 것을 재현해 막은 것이에요.

## 3. 공식 출처 대조 결과

대상은 1-4, 1-5, 3-2, 3-3, 4-4, 4-5, 4-6, 7-2예요. 항목마다 문서 직접 링크, 발행 기관, 기준일, 확인일을 적었어요.

### 주요 정정

| 글 | 정정 | 근거 |
|---|---|---|
| 4-5 | 일반 ISA 5년 제한·이월 폐지 「예고」 삭제. 2026-09-01 정부안에서 철회 | 재정경제부 정부안 확정 자료(원문 직접 확인) |
| 4-5 | 생산적금융 ISA를 수정된 정부안·국회 계류 상태로 갱신 | 재정경제부, 국회 의안 2221039 |
| 4-5, 4-6 | ISA 비과세는 매년이 아니라 해지일 기준 합산 | 조특법 §91조의18⑤ |
| 4-4 | 세액공제 없는 납입 원금은 과세 제외, 연 1,800만원 납입 한도, 연금수령한도 | 국세청, 금융감독원 |
| 1-5 | 대주주 지분율 요건 추가, 고배당 분리과세 추가 | 국세청, 정책브리핑 |
| 3-3 | 핵심 답변의 W-8BEN 전제·신고 구분, 예정신고 대상 한정, RIA 특례 추가 | 국세청, IRS, 재정경제부 |
| 1-4 | NXT 종목 수 650 → 600종목 남짓, 동시호가 적용 범위 한정 | 넥스트레이드 공지, KRX |
| 3-2 | Arca 22시간 → 23시간 체제, 가격 제한 표현 정정, 나스닥 목표일 한국시간 병기 | SEC·Federal Register, Nasdaq |
| 7-2 | 2027-02-04 시행 부분을 「증권사 중개」에서 제166조(장외거래)로 정정 | 자본시장법 부칙(원문 직접 확인) |

### 확인하지 못했거나 공식 자료가 아닌 것

| 글 | 항목 | 상태 |
|---|---|---|
| 3-3 | 양도차손 이월 불가 | 공식 문구 미확인. 반대 근거도 없어 본문 유지, 글 끝에 고지 |
| 3-3 | 12월 말 매도분의 귀속 연도 | 공식 문서 미확정. 글 끝에 고지 |
| 3-3 | 낼 세금이 0원일 때 양도소득세 신고 의무 | 소득세법 조문 미확인. 단정하지 않고 국세청 확인 안내 |
| 3-3 | 국내상장 해외 ETF 상품 간 손익통산 제한 | 질의회신 본문 미열람 |
| 3-3 | 지방소득세 10%, 2026년판 국세청 책자 | 이번에 재열람 못 함. 이전 검증과 2025년판 기준 |
| 1-5 | 거래세 0.35%, 수수료율 | 2025년 KRX 자료, 증권사 공시 표본 |
| 4-4 | 부득이한 사유 중 개인회생의 세율, 연금저축 인출 사유 무제한 | 직접 문구 미확인 |
| 4-4 | 인버스·레버리지 ETF 제외 | 2017년 자료. 해제 근거 없음 |
| 4-5 | 만기 연장 시 결격, ISA 상품별 손익통산 범위 | 시행령 본문 미열람 |
| 4-5 | 생산적금융 ISA 조세소위 경과와 조문 | 11/9 현재 계류까지만 확인 |
| 1-4 | 애프터마켓 시행일, NXT 주문 유지, KRX 프리마켓 연기 | 증권사 공지·언론 |
| 1-4 | 시간외단일가 옛 규칙, 스마트 주문 기본값, 시가·종가 결정 주체 | 공식 문구 미확인 |
| 1-3 | 동시호가 설명 범위 | 1-4와 같은 한정 표현을 넣을지 추후 검토 |
| 3-2 | 나스닥 12월 6일 목표의 11월 현재 유지 여부 | 최신 공식 문서 2026-09-24 |
| 7-2 | 8월 7일 예탁원 공개 내용 | 언론 보도만 확인 |

## 4. 검증 결과

| 항목 | 결과 |
|---|---|
| `npm run build` | 성공 |
| `npm test` | 71개 통과, 실패 0 (기존 64개 + 신규 7개) |
| 사이트맵 URL | 47개 모두 로컬 200 |
| 없는 주소 | 로컬·운영 모두 404 |
| 내부 링크·앵커 | 끊긴 링크 0건 |
| 제목·설명 중복, canonical | 중복 0건, 전부 대표 URL과 일치 |
| 도표 | 11개 모두 렌더링, `Syntax error` 0건 |
| 모바일 375px | 47개 페이지 가로 넘침 0건, 콘솔 오류 0건 |
| 외부 링크 57개 | 55개 200. SEC 1건 403(자동 요청 차단, 조사 때는 내용 확인), aboutads 1건 429 |
| 쿠키·외부 요청 | 로컬 빌드 확인 결과 쿠키 없음, 외부 요청 없음 |
| robots.txt, sitemap.xml, ads.txt | 운영 사이트 200. robots는 전체 허용 |
| 고립된 글 | 없음. 그래서 글별 내부 링크는 추가하지 않음 |
| 수정 전후 화면 | `docs/audits/2026-11-09/` |

운영 사이트에는 배포하지 않았어요. 위 로컬 결과는 빌드 산출물 기준이에요.

## 5. 운영자에게 필요한 결정과 계정 작업

1. **소개 페이지의 AI 사용 고지 문구 확인.** 저장소에서 확인되는 범위로 썼어요. 사람이 실제 검수한 범위를 운영자가 확인해 주세요.
2. **Search Console 현황 확인.** 색인 수, 노출, 제외 사유를 `measurement.md` 기록표에 남기세요.
3. **애드센스 재심사 시점.** `maintenance.md`의 기준은 색인 20개 이상과 노출 발생이에요. 이 사이트는 승인 후에야 광고 단위를 발급받을 수 있어요.
4. **광고 활성화 시 필요한 값.** top·mid·bottom 광고 단위 ID, SPA 리필 구현, `ADSENSE_CLIENT`, 개인정보처리방침 현재 상태 문구 수정.
5. **동의 관리.** 유럽 경제 지역·영국·스위스 방문자에게 맞춤 광고를 내보내려면 Google 인증 CMP 설정이 필요한지 애드센스 콘솔에서 확인하세요.
6. **분석 도구 선택.** Cloudflare Web Analytics 또는 GA4 중 하나만. 지금은 미설치.

## 6. 배포 전 남은 작업

- 변경 사항 검토 후 커밋·PR·배포 지시
- 배포 뒤 `maintenance.md` 5장의 절차로 운영 반영 확인
- 2026-11-13 코너스톤 시행, 2026-12-06 나스닥 23시간 재확인
- 정기국회 세법 처리 뒤 4-5 재확인
- `.playwright-mcp/` 폴더 삭제 (브라우저 도구 로그, 커밋 대상 아님)

## 7. 글별 점검표

작성자·날짜는 Article 구조화 데이터 값이에요. 404 페이지는 제외했어요. 표의 수정일은 출처 작업 반영 뒤 빌드 기준이에요.

| URL | 제목 | 설명 | 작성자 | 작성일 | 수정일 | canonical | robots | 구조화 데이터 |
|---|---|---|---|---|---|---|---|---|
| `/` | 주식·투자 상식 사전 | 62자 | — | — | — | 일치 | index, follow | — |
| `/about/` | 이 사이트 소개 \| 주식·투자 상식 사전 | 56자 | — | — | — | 일치 | index, follow | — |
| `/about/contact` | 문의 \| 주식·투자 상식 사전 | 51자 | — | — | — | 일치 | index, follow | — |
| `/about/disclaimer` | 면책조항 \| 주식·투자 상식 사전 | 49자 | — | — | — | 일치 | index, follow | — |
| `/about/privacy` | 개인정보처리방침 \| 주식·투자 상식 사전 | 43자 | — | — | — | 일치 | index, follow | — |
| `/part1-basics/1-1-what-is-stock` | 주식이란 무엇인가 — 회사 지분을 산다는 것의 의미 \| 주식·투자 상식 사전 | 96자 | yshyuk | 2026-07-27 | 2026-07-27 | 일치 | index, follow | Article, BreadcrumbList |
| `/part1-basics/1-2-open-brokerage-account` | 증권계좌 개설, 어디서 어떻게 하나 \| 주식·투자 상식 사전 | 108자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part1-basics/1-3-how-to-buy-stocks` | 주식 사는 법 — 호가창, 시장가/지정가 주문 이해하기 \| 주식·투자 상식 사전 | 121자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part1-basics/1-4-trading-hours` | 매매 시간과 장전·장후 거래 — 주식은 몇 시부터 몇 시까지 살 수 있나 \| 주식·투자 상식 사전 | 145자 | yshyuk | 2026-07-28 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part1-basics/1-5-fees-and-taxes` | 주식 수수료와 세금 — 사고팔면 정확히 뭘 얼마나 떼이나 \| 주식·투자 상식 사전 | 111자 | yshyuk | 2026-07-28 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part1-basics/1-6-market-cap-price-volume` | 시가총액·주가·거래량, 숫자 읽는 법 — 주가가 싸다고 싼 회사가 아니다 \| 주식·투자 상식 사전 | 111자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-1-kospi-vs-kosdaq` | 코스피 vs 코스닥, 뭐가 다른가 — 상장기업 성격으로 구분하는 두 시장 \| 주식·투자 상식 사전 | 108자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-2-how-kospi-index-works` | 코스피 지수는 어떻게 계산되나 — 시가총액 가중 방식 이해하기 \| 주식·투자 상식 사전 | 126자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-3-dividend-basics` | 배당은 언제까지 사야 받을 수 있나 — 배당기준일·배당락·배당수익률 이해하기 \| 주식·투자 상식 사전 | 125자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-4-ipo-subscription` | 공모주 청약, 어떻게 참여하나 — 균등배정과 비례배정, 증거금 계산까지 \| 주식·투자 상식 사전 | 130자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-5-capital-increase-and-split` | 유상증자·무상증자·액면분할이 주가에 미치는 영향 — 뭐가 다른가 \| 주식·투자 상식 사전 | 140자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-6-price-limit-circuit-breaker` | 상한가·하한가·서킷브레이커 — 시장의 안전장치 \| 주식·투자 상식 사전 | 130자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part2-korea-market/2-7-short-selling` | 공매도란 무엇이고 왜 논란인가 \| 주식·투자 상식 사전 | 112자 | yshyuk | 2026-07-28 | 2026-07-28 | 일치 | index, follow | Article, BreadcrumbList |
| `/part3-us-overseas/3-1-why-us-stocks` | 미국주식, 왜 하는가 — 국내주식과의 차이 \| 주식·투자 상식 사전 | 115자 | yshyuk | 2026-08-05 | 2026-08-05 | 일치 | index, follow | Article, BreadcrumbList |
| `/part3-us-overseas/3-2-us-trading-hours` | 미국주식 거래 시간과 프리마켓·애프터마켓 — 미국장은 한국시간 몇 시에 열리나 \| 주식·투자 상식 사전 | 131자 | yshyuk | 2026-08-05 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part3-us-overseas/3-3-us-stock-tax` | 미국주식 세금 — 양도소득세 250만원 공제 이해하기 \| 주식·투자 상식 사전 | 118자 | yshyuk | 2026-08-05 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part3-us-overseas/3-4-exchange-rate` | 환율과 환전 — 환헤지 vs 환노출, 주가는 올랐는데 왜 손해일까 \| 주식·투자 상식 사전 | 114자 | yshyuk | 2026-08-05 | 2026-08-05 | 일치 | index, follow | Article, BreadcrumbList |
| `/part3-us-overseas/3-5-us-indices` | S&P500·나스닥·다우 — 3대 지수 구분하기 \| 주식·투자 상식 사전 | 120자 | yshyuk | 2026-08-05 | 2026-08-05 | 일치 | index, follow | Article, BreadcrumbList |
| `/part3-us-overseas/3-6-us-dividend-investing` | 미국 배당주와 배당 성장 투자 — 분기 배당과 배당귀족 이해하기 \| 주식·투자 상식 사전 | 109자 | yshyuk | 2026-08-05 | 2026-08-05 | 일치 | index, follow | Article, BreadcrumbList |
| `/part4-etf-pension/4-1-what-is-etf` | ETF란 무엇인가 — 펀드와 뭐가 다른가 \| 주식·투자 상식 사전 | 102자 | yshyuk | 2026-08-07 | 2026-08-07 | 일치 | index, follow | Article, BreadcrumbList |
| `/part4-etf-pension/4-2-index-investing` | 인덱스 투자 — 왜 "시장을 사라"고 하는가 \| 주식·투자 상식 사전 | 112자 | yshyuk | 2026-08-07 | 2026-08-07 | 일치 | index, follow | Article, BreadcrumbList |
| `/part4-etf-pension/4-3-how-to-choose-etf` | ETF 고르는 법 — 운용보수, 괴리율, 추적오차 \| 주식·투자 상식 사전 | 112자 | yshyuk | 2026-08-07 | 2026-08-07 | 일치 | index, follow | Article, BreadcrumbList |
| `/part4-etf-pension/4-4-pension-fund-vs-irp` | 연금저축펀드 vs IRP — 세액공제 활용법 \| 주식·투자 상식 사전 | 102자 | yshyuk | 2026-08-07 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part4-etf-pension/4-5-isa-account` | ISA 계좌, 왜 만능통장이라 부르나 \| 주식·투자 상식 사전 | 136자 | yshyuk | 2026-08-07 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part4-etf-pension/4-6-tax-account-priority` | 절세 계좌 3종 우선순위 — 뭐부터 채워야 하나 \| 주식·투자 상식 사전 | 107자 | yshyuk | 2026-08-07 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part5-analysis/5-1-how-to-read-dart` | 재무제표, 어디서 보고 뭘 봐야 하나 (DART 사용법) \| 주식·투자 상식 사전 | 107자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part5-analysis/5-2-per` | PER — 이 주식은 비싼가 싼가 \| 주식·투자 상식 사전 | 110자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part5-analysis/5-3-pbr-roe` | PBR과 ROE — 자산과 수익성으로 보는 기업 \| 주식·투자 상식 사전 | 116자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part5-analysis/5-4-income-statement` | 매출·영업이익·순이익, 손익계산서 읽기 \| 주식·투자 상식 사전 | 105자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part5-analysis/5-5-debt-ratio` | 부채비율과 유동비율 — 망하지 않을 회사 고르기 \| 주식·투자 상식 사전 | 92자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part5-analysis/5-6-limits-of-valuation` | 가치평가의 한계 — 지표만 보면 안 되는 이유 \| 주식·투자 상식 사전 | 113자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-1-interest-rate-and-stocks` | 금리와 주가의 관계 — 왜 금리가 오르면 주가가 떨어지나 \| 주식·투자 상식 사전 | 125자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-2-inflation` | 인플레이션과 투자 — 현금은 왜 녹는가 \| 주식·투자 상식 사전 | 99자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-3-diversification` | 분산투자와 포트폴리오 — 계란을 나눠 담는 법 \| 주식·투자 상식 사전 | 112자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-4-investor-psychology` | 투자 심리 — 물타기, 손절, FOMO를 다루는 법 \| 주식·투자 상식 사전 | 108자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-5-compound-interest` | 복리의 힘 — 장기투자가 유리한 수학적 이유 \| 주식·투자 상식 사전 | 109자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-6-reading-economic-news` | 경제 뉴스 읽는 법 — FOMC, CPI, 고용지표가 뭐길래 \| 주식·투자 상식 사전 | 119자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part6-common-sense/6-7-investment-scams` | 흔한 투자 사기 유형과 피하는 법 \| 주식·투자 상식 사전 | 113자 | yshyuk | 2026-08-10 | 2026-08-10 | 일치 | index, follow | Article, BreadcrumbList |
| `/part7-trends/2026-cornerstone-investor-ipo` | 공모주 코너스톤투자자 제도, 무엇이 바뀌나 — 2026년 10월 시점의 기록 \| 주식·투자 상식 사전 | 136자 | yshyuk | 2026-10-06 | 2026-10-06 | 일치 | index, follow | Article, BreadcrumbList |
| `/part7-trends/2026-fractional-investment-sto` | 조각투자와 토큰증권, 제도는 어디까지 왔나 — 2026년 8월 시점의 기록 \| 주식·투자 상식 사전 | 119자 | yshyuk | 2026-08-11 | 2026-11-09 | 일치 | index, follow | Article, BreadcrumbList |
| `/part7-trends/2026-h2-market-trends` | 2026년 하반기 시장 지형 — 2026년 8월 시점에서 본 것들 \| 주식·투자 상식 사전 | 105자 | yshyuk | 2026-08-10 | 2026-10-27 | 일치 | index, follow | Article, BreadcrumbList |
| `/part7-trends/2026-krx-aftermarket` | 한국거래소 애프터마켓, 무엇이 바뀌었나 — 2026년 10월 시점의 기록 \| 주식·투자 상식 사전 | 150자 | yshyuk | 2026-10-27 | 2026-10-27 | 일치 | index, follow | Article, BreadcrumbList |
