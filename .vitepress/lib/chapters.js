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
