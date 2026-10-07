<script setup lang="ts"></script>

<template>
  <footer class="site-footer">
    <span>FLOWING CLARITY</span>
    <span>留一點空白，給自己。</span>
  </footer>
</template>

<style scoped>
.site-footer {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(28px, 6vw, 116px);
  font-family: var(--font-editorial);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--color-paper);
  background: var(--color-bark);
}
</style>
