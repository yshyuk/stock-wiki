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
