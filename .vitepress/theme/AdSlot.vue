<script setup>
// TODO(애드센스 활성화 전 확인할 것 — 리뷰 발견 F, 2026-08):
// 1. data-ad-slot이 없다. AdSense 디스플레이 광고 단위는 ADSENSE_CLIENT(발행자 ID)뿐 아니라
//    슬롯별 ad-unit ID(data-ad-slot)가 있어야 실제로 게재된다. 지금은 클라이언트 ID만 채워도
//    광고가 나오지 않는다. AdSense 계정을 만들고 top/mid/bottom 슬롯마다 ad-unit을 발급받아
//    position별로 다른 data-ad-slot을 넣어야 한다.
// 2. top/bottom 슬롯은 SPA 네비게이션에서 리필되지 않는다. 이 두 슬롯은 VPDoc의
//    doc-before/doc-after에 마운트되는데, 그 컴포넌트는 클라이언트 사이드 라우팅 시 재생성되지
//    않아 onMounted의 push가 최초 하드 로드 1회만 실행된다. 이후 페이지를 이동하면 <ins>에
//    data-adsbygoogle-status="done"이 이미 붙어 있어 새 광고로 채워지지 않는다.
//    (mid 슬롯은 페이지 컴포넌트 내부에 있어 라우팅마다 재마운트되므로 이 문제가 없다 —
//    세 슬롯이 서로 다르게 동작하게 된다.) 라우트 변경 감지 후 push를 다시 트리거하는 로직이
//    필요하다(예: useRoute() watch 또는 router.onAfterRouteChange).
// 계정이 없어 실제 슬롯 ID도, 리필 동작도 테스트할 수 없어 지금은 구현하지 않는다.
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
