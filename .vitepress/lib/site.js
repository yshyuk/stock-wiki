export const SITE_URL = 'https://stock-wiki.digestive-coffee.blog'
export const SITE_TITLE = '주식·투자 상식 사전'
export const SITE_DESCRIPTION =
  '증권계좌 개설부터 ETF·연금까지, 주식 투자에 필요한 상식을 검색 질문 하나에 하나씩 답하는 온라인 책이에요.'

// 애드센스 승인 후 'ca-pub-XXXXXXXXXXXXXXXX' 를 채운다.
// 빈 문자열인 동안 AdSlot은 아무것도 렌더하지 않는다.
// 채울 때는 about/privacy.md의 「광고와 쿠키」 절 앞 현재 상태 문장("아직 광고를
// 게재하고 있지 않아요")과 시행일도 함께 최신 날짜로 업데이트할 것.
//
// ⚠️ 켜기 전에 파트 7의 mid 슬롯 위치를 먼저 검토할 것.
// mid 슬롯은 `##` 섹션이 4개 이상일 때 3번째 섹션 앞에 들어가는데(config.js의
// minSections 4 / beforeSection 3), 파트 7 글은 그 자리가 하필 "이 글에는 회사나
// 서비스 이름이 한 곳도 나오지 않아요"라는 벤더 중립성 선언 직후가 된다
// (7-2에서 실제로 그렇다). 애드센스는 문맥 타깃이라 그 페이지에 붙을 개연성이
// 가장 높은 광고가 바로 그 글이 언급을 거부한 업종이다.
// 선택지: ① 해당 선언을 「이 글이 다루지 않는 것」 절로 옮긴다
//         ② beforeSection을 페이지별로 조정한다 ③ 파트 7만 mid 슬롯에서 제외한다
export const ADSENSE_CLIENT = ''
