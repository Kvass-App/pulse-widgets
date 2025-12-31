<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { Icon, Button, Input, Dialog } from '@kvass/ui'

const reference = ref('')
const shortenedReference = ref('')
const loading = ref(true)
const pollCount = ref(0)
const MAX_POLL_ATTEMPTS = 60

const config = window.packtivationConfig

const handleClick = () => {
  window.location.href = '/bestill-sjokolade'
}

const checkPaymentStatus = async () => {
  try {
    const response = await fetch(
      `${config.serverUrl}/api/integration/${config.integrationId}/callbacks/getOrderStatus?reference=${reference.value}`,
    )

    const order = await response.json()

    if (!order || !order.sessionState) {
      //   console.log('No order or sessionState found')
      window.location.href = '/error'
      return
    }

    // Terminal states - stop polling
    const TERMINAL_STATES = [
      'PaymentSuccessful',
      'PaymentTerminated',
      'PaymentFailed',
      'SessionExpired',
      'SessionTerminated',
      'PaymentInitiationFailed',
    ]

    // Non-terminal states - continue polling
    const NON_TERMINAL_STATES = [
      'SessionStarted',
      'SessionCreated',
      'PaymentInitiated',
    ]

    // Check if terminal state
    if (TERMINAL_STATES.includes(order.sessionState)) {
      if (order.sessionState === 'PaymentSuccessful') {
        // Success - clear cart and show confirmation
        localStorage.removeItem('freia-shopping-cart')
        window.dispatchEvent(new Event('cart-updated'))
        loading.value = false
        return
      } else {
        // Failed/expired - redirect to error
        // console.log(`Payment failed or expired:`, order.sessionState)
        window.location.href = '/error'
        return
      }
    }

    // Check if non-terminal state - poll again
    if (NON_TERMINAL_STATES.includes(order.sessionState)) {
      pollCount.value++

      if (pollCount.value >= MAX_POLL_ATTEMPTS) {
        // console.log('Max poll attempts reached, redirecting to error')
        window.location.href = '/error'
        return
      }

      //   console.log(
      //     `Payment in progress (${order.sessionState}), polling again... (${pollCount.value}/${MAX_POLL_ATTEMPTS})`,
      //   )

      // Poll again after 2 seconds
      setTimeout(() => {
        checkPaymentStatus()
      }, 2000)
      return
    }

    // Unknown state - redirect to error
    // console.log('Unknown sessionState:', order.sessionState)
    window.location.href = '/error'
  } catch (error) {
    // console.log('Error fetching order status:', error)

    // If we're polling and hit a network error, retry
    if (pollCount.value > 0 && pollCount.value < MAX_POLL_ATTEMPTS) {
      pollCount.value++
      //   console.log('Network error during polling, retrying...')
      setTimeout(() => {
        checkPaymentStatus()
      }, 2000)
      return
    }

    // First attempt failed or max retries reached
    window.location.href = '/error'
  }
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  reference.value = params.get('reference')

  if (!reference.value) {
    // console.log('No reference found in URL')
    window.location.href = '/error'
    return
  }

  shortenedReference.value =
    params.get('reference')?.slice(0, 8).toUpperCase() || ''

  checkPaymentStatus()
})
</script>

<template>
  <div v-if="loading" class="loading">
    <svg
      class="spinner"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"
      />
    </svg>
    <p>Bekrefter betaling...</p>
  </div>

  <div v-else>
    <div class="confirmation">
      <img
        src="https://assets.kvass.no/6946f3d0f947328eefe09ea9"
        alt="checkmark-ikon"
      />

      <h1>Takk for din bestilling!</h1>

      <p>
        Din betaling er bekreftet og ordren er mottatt. Bekreftelse er sendt til
        din e-post.
      </p>

      <div class="confirmation__order-number">
        <span class="confirmation__order-number-label">Ordrenummer</span>

        <span class="confirmation__order-number-font"
          >#{{ shortenedReference }}</span
        >
      </div>
    </div>

    <div class="confirmation__additional">
      <Button
        variant="primary"
        label="Bestill mer sjokolade"
        icon-right="fa-solid:arrow-right"
        @click="handleClick"
      >
      </Button>

      <p :style="{ marginTop: '1rem' }">Har du spørsmål om bestillingen din?</p>

      <p>Mondelēz forbrukerkontakt, tlf. 21 53 08 57.</p>
    </div>
  </div>
</template>

<style lang="scss">
@import '@kvass/ui/style.css';

.confirmation {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 3rem;

  max-width: 700px;
  text-align: center;
  margin: auto;

  $primary: #e2001a;
  --k-button-primary-background: #{$primary};

  $breakpoint: 1024px;

  @media (max-width: $breakpoint) {
    padding: 1.5rem;
  }

  h1 {
    font-family: 'Cupcake', sans-serif;
    color: #8f4628;
    margin: 0;
    margin-bottom: 0rem;
    font-size: 4rem;

    @media (max-width: $breakpoint) {
      font-size: 1.875rem;
    }
  }

  h3 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1.125rem;
    max-width: 350px;
    margin: auto;

    @media (max-width: $breakpoint) {
      font-size: 1rem;
    }
  }

  &__order-number {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0rem;

    text-align: center;
    margin: auto;
    width: fit-content;
    padding: 1rem;
    margin-top: 1.5rem;

    border: 2px solid rgba(199, 165, 0, 0.5);
    border-radius: 14px;
  }

  &__order-number-label {
    font-weight: 300;
    color: #64748b;

    font-size: 0.875rem;
  }

  &__order-number-font {
    font-size: 1.5rem;

    @media (max-width: $breakpoint) {
      font-size: 1.25rem;
    }
  }

  &__additional {
    --k-button-primary-background-hover: #9e0122;

    margin: auto;
    margin-top: 1rem;
    width: 100% !important;
    max-width: 796px;

    .k-button {
      width: 100%;
      border-radius: 20px;

      font-weight: 700 !important;

      &:hover {
        color: #ffffff;
        outline: 2px solid #e3001a;
        outline-offset: -2px;
      }
    }

    .k-button__content {
      justify-content: center;
    }

    p {
      margin: 0;
      font-weight: 300 !important;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;

  p {
    font-size: 1.125rem;
    color: #64748b;
    margin: 0;
  }
}

.spinner {
  width: 48px;
  height: 48px;
  fill: #c7a500;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
