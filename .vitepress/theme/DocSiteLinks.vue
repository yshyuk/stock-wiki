<script setup>
// 링크 목록을 또 만들지 않고 전역 footer 설정(config.js)을 그대로 재사용한다.
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <div class="doc-site-links" v-html="theme.footer?.message" />
</template>
