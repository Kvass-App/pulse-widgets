<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { Icon, Button, Input, Dialog } from '@kvass/ui'
import { bus } from '../bus'
import { buildVippsOrderLines } from '../utils/vipps'

const dialogRef = ref()
const loading = ref(false)
const error = ref(null)

const config = window.packtivationConfig

onMounted(() => {
  bus.on('vipps:open', async () => {
    dialogRef.value?.open()
    loading.value = true
    error.value = null

    try {
      const session = await createVippsSession()

      initVippsCheckout(session)
    } catch (e) {
      error.value = e.message
      console.error(e)
      window.location.href = '/error'
    } finally {
      loading.value = false
    }
  })
})

onUnmounted(() => {
  bus.off('vipps:open')
})

const ENDPOINT = `${config.serverUrl}/api/integration/${config.integrationId}/callbacks/createSession`

const createVippsSession = async () => {
  const orderLines = JSON.parse(localStorage.getItem('freia-shopping-cart'))

  if (!orderLines) throw new Error(`No products in local storage`)

  const payload = buildVippsOrderLines(orderLines)

  const response = await fetch(`${ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // console.log(response.statusText)
    throw new Error(`Failed to create session: ${response.statusText}`)
  }

  return response.json()
}

const initVippsCheckout = (session) => {
  window.VippsCheckout({
    checkoutFrontendUrl: session.checkoutFrontendUrl,
    iFrameContainerId: 'vipps-checkout-frame',
    language: 'nb',
    token: session.token,
    on: {
      session_status_changed: (status) => {
        // console.log('Session status:', status)

        if (
          status === 'SessionExpired' ||
          status === 'SessionTerminated' ||
          status === 'PaymentFailed'
        ) {
          window.location.href = '/error'
        }
      },
    },
  })
}
</script>

<template>
  <Dialog
    ref="dialogRef"
    :show-close-trigger="true"
    class="vipps-modal"
    :close-on-outside-click="false"
  >
    <div v-if="loading" :style="{ backgroundColor: '#FFFFFF' }">
      Laster Vipps...
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div id="vipps-checkout-frame"></div>
  </Dialog>
</template>

<style lang="scss">
@import '@kvass/ui/style.css';

.k-button {
  background-color: #271814;
  color: #fff;
}
</style>
