export const SITE_URL = 'https://digestive-coffee.com'
export const SITE_TITLE = '주식·투자 상식 사전'
export const SITE_DESCRIPTION =
  '증권계좌 개설부터 ETF·연금까지, 주식 투자에 필요한 상식을 검색 질문 하나에 하나씩 답하는 온라인 책이에요.'

// 애드센스 발행자 ID는 'ca-pub-8084693884500389'이다(public/ads.txt 참고).
// ⚠️ 그런데 아직 채우지 마라. 지금 채우면 광고가 나오는 게 아니라 빈 슬롯이 뜬다 —
// AdSlot.vue에 data-ad-slot(광고 단위 ID)이 없기 때문이다. 상세는 그쪽 상단 주석.
// 켜는 순서: ① 콘솔에서 digestive-coffee.com 사이트 추가·승인 → ② top/mid/bottom
// 광고 단위 3개 발급 → ③ AdSlot.vue에 슬롯 ID 주입 + SPA 리필 로직 → ④ 여기를 채운다.
//
// 빈 문자열인 동안 AdSlot은 아무것도 렌더하지 않는다.
// 채울 때는 about/privacy.md의 「광고와 쿠키」 절 앞 현재 상태 문장("아직 광고를
// 게재하고 있지 않아요")과 시행일도 함께 최신 날짜로 업데이트할 것.
//
// 이 사이트는 digestive-coffee.com의 apex에 있다. 애드센스는 서브도메인을 개별
// 심사하지 않고 최상위 도메인의 상태를 상속시키므로, apex에 두는 것이 곧 심사 대상을
// 이 위키로 만드는 장치다. 위키를 늘려 서브도메인으로 옮기더라도 승인은 도메인에
// 붙으니 유지된다. 기술 블로그(digestive-coffee.blog)와 도메인을 나눈 이유도 같다 —
// 한 도메인 = 하나의 관문이라, 같이 두면 한쪽 판정이 다른 쪽을 막는다.
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
