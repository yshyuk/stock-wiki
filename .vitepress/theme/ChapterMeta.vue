<script setup>
// 챕터 제목 아래에 「글쓴이 · 작성일 · 수정일」 한 줄을 보여준다.
// 화면에 저자와 날짜가 없으면 독자도 검색엔진도 이 글이 누가 언제 쓴 것인지 알 수 없다.
// 날짜는 git이 아니라 frontmatter(date, updated)에서 읽는다 — 배포 환경의 clone 깊이에
// 따라 git 시각이 전부 빌드 시각으로 뭉개질 수 있어 frontmatter가 더 믿을 만하다.
import { computed } from 'vue'
import { useData } from 'vitepress'
import { AUTHOR_NAME } from '../lib/site.js'

const { frontmatter } = useData()

/** Date 객체든 ISO 문자열이든 `2026-07-28` 형태로 맞춘다. */
function toDateString(value) {
  if (!value) return ''
  const s = value instanceof Date ? value.toISOString() : String(value)
  return s.slice(0, 10)
}

const isChapter = computed(
  () => typeof frontmatter.value.part === 'number' && typeof frontmatter.value.order === 'number'
)
const published = computed(() => toDateString(frontmatter.value.date))
const updated = computed(() => {
  const u = toDateString(frontmatter.value.updated)
  return u && u !== published.value ? u : ''
})
</script>

<template>
  <p v-if="isChapter && published" class="chapter-meta">
    <span class="chapter-meta__item">글쓴이 <a href="/about/">{{ AUTHOR_NAME }}</a></span>
    <span class="chapter-meta__item">작성 <time :datetime="published">{{ published }}</time></span>
    <span v-if="updated" class="chapter-meta__item">수정 <time :datetime="updated">{{ updated }}</time></span>
  </p>
</template>
