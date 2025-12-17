<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { Icon, Button, Input, Dialog } from '@kvass/ui'
import { bus } from '../bus'

const dialogRef = ref()

onMounted(() => {
  bus.on('vipps:open', () => {
    dialogRef.value?.open()
  })
})

onUnmounted(() => {
  bus.off('vipps:open')
})
</script>

<template>
  <Dialog
    ref="dialogRef"
    title="Betal med vipps"
    :show-close-trigger="true"
    alignment="center"
  >
  </Dialog>
</template>

<style lang="scss">
@import '@kvass/ui/style.css';

.k-button {
  background-color: #ff5c24;
  color: #fff;
}
</style>
