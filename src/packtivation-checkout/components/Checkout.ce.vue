<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { Icon, Button, Input, Flex } from '@kvass/ui'
import { bus } from '../bus'
import NumberInput from './NumberInput.ce.vue'

const SHIPPING_COST_PER_UNIT = 22.5

const vippsbuttonPromise = ref(null)

const shoppingCart = ref(
  JSON.parse(localStorage.getItem('freia-shopping-cart') || '[]'),
)

const handleVippsClick = async () => {
  // Check if total quantity exceeds 40
  if (totalCartQuantity.value > 40) {
    alert(
      'Du kan ikke legge til mer enn 40 sjokolader i handlekurven. Kontakt oss på freia@pulse.no for større bestillinger.',
    )
    return
  }

  bus.emit('vipps:open')
}

const totalCartQuantity = computed(() => {
  return shoppingCart.value.reduce((sum, item) => sum + item.quantity, 0)
})

const isIncrementDisabled = (productId) => {
  return totalCartQuantity.value >= 40
}

const increaseQuantity = (id) => {
  if (totalCartQuantity.value >= 40) {
    alert(
      'Du kan ikke legge til mer enn 40 sjokolader i handlekurven. Kontakt oss på freia@pulse.no for større bestillinger.',
    )
    return
  }
  const product = shoppingCart.value.find((p) => p.id === id)
  if (product) product.quantity++
}

const decreaseQuantity = (id) => {
  const product = shoppingCart.value.find((p) => p.id === id)
  if (product && product.quantity > 1) product.quantity--
}

const removeProduct = (id) => {
  shoppingCart.value = shoppingCart.value.filter((p) => p.id !== id)
}

const deleteCart = () => {
  shoppingCart.value = []
}

const goToShop = () => {
  window.location.href = '/bestill-sjokolade'
}

const cartTotalInclMva = computed(() => {
  return shoppingCart.value.reduce((sum, product) => {
    return sum + product.price * product.quantity
  }, 0)
})

const subtotalExclMva = computed(() => {
  return cartTotalInclMva.value / 1.25
})

const mvaAmount = computed(() => {
  return cartTotalInclMva.value - subtotalExclMva.value
})

const shippingCost = computed(() => {
  return totalCartQuantity.value * SHIPPING_COST_PER_UNIT
})

const totalPrice = computed(() => {
  return cartTotalInclMva.value + shippingCost.value
})

watch(
  shoppingCart,
  (newValue) => {
    localStorage.setItem('freia-shopping-cart', JSON.stringify(newValue))
    window.dispatchEvent(
      new CustomEvent('cart-updated', {
        bubbles: true,
        composed: true,
      }),
    )
  },
  { deep: true },
)
</script>

<template>
  <div class="cart" v-if="shoppingCart.length">
    <div class="cart__products">
      <div class="cart__header">
        <Flex align="center" gap="0.5rem">
          <img
            src="https://assets.kvass.no/69388eed4a6bbc745f6a26c9"
            alt="handlekurv"
          />
          <h3>Dine produkter ({{ shoppingCart.length }})</h3>
        </Flex>

        <span
          class="cart__delete-cart"
          @click="deleteCart"
          :style="{ color: '#E2001A', fontSize: '0.875rem', cursor: 'pointer' }"
          >Tøm handlekurv</span
        >
      </div>

      <div
        class="cart__product"
        v-for="product in shoppingCart"
        :key="product.id"
      >
        <div class="cart__product-content">
          <p class="cart__product-title">{{ product.message }}</p>
          <p class="cart__product-meta">
            {{
              product.category.charAt(0).toUpperCase() +
              product.category.slice(1)
            }}
            •
            {{ product.type.charAt(0).toUpperCase() + product.type.slice(1) }}
          </p>
          <div class="cart__product-price">
            <span :style="{ fontWeight: '500', color: '#8F4628' }"
              >{{ product.price.toFixed(2) }} kr</span
            >
            <span :style="{ fontWeight: '500', color: '#64748B' }">
              / 200 g plate</span
            >
          </div>

          <NumberInput
            class="cart__number-input"
            :units="product.quantity"
            :disabled="isIncrementDisabled(product.id)"
            @update="
              (val) => (product.quantity = Math.max(1, parseInt(val) || 1))
            "
            @decrement="decreaseQuantity(product.id)"
            @increment="increaseQuantity(product.id)"
          />
        </div>

        <div class="cart__product-actions">
          <button
            class="cart__product-delete"
            @click="removeProduct(product.id)"
          >
            <img
              src="https://assets.kvass.no/693ada611ac2bac2478a6f9f"
              alt="trash-bin-icon"
            />
          </button>
          <p
            class="cart__product-total"
            :style="{ fontWeight: 300, color: '#5D5D5D' }"
          >
            {{ (product.price * product.quantity).toFixed(2) }} kr
          </p>
        </div>
      </div>

      <div class="cart__disclaimer">
        <img
          class="cart__info-disclaimer"
          src="https://assets.kvass.no/6941484756b728f9da3572d0"
          alt="info-ikon"
        />

        <span
          :style="{ fontSize: '0.75rem', color: '#64748B', textAlign: 'start' }"
          >Når dette produktet er tilpasset for dine behov godtar du at
          returretten bortfaller. Dette betyr at du ikke kan returnere produktet
          etter at det har blitt personalisert. Dobbeltsjekk detaljer og/eller
          velg riktige produkter før du fullfører bestillingen.</span
        >
      </div>
    </div>

    <div class="cart__summary">
      <h3>Ordredetaljer</h3>

      <div class="cart__summary-details">
        <Flex justify="space-between">
          <span class="cart__order-line">Delsum (ekskl. mva.)</span
          ><span class="cart__order-line"
            >{{ subtotalExclMva.toFixed(2) }} kr.</span
          >
        </Flex>

        <Flex justify="space-between">
          <span class="cart__order-line">MVA (25%)</span
          ><span class="cart__order-line">{{ mvaAmount.toFixed(2) }} kr.</span>
        </Flex>

        <Flex justify="space-between">
          <span class="cart__order-line">Frakt</span
          ><span class="cart__order-line"
            >{{ shippingCost.toFixed(2) }} kr.</span
          >
        </Flex>
      </div>

      <Flex justify="space-between">
        <span
          class="cart__order-line"
          :style="{ fontSize: '1rem', color: '#272727' }"
          >Totalpris</span
        ><span
          class="cart__order-line"
          :style="{ fontSize: '1.25rem', color: '#272727' }"
          >{{ totalPrice.toFixed(2) }} kr.</span
        >
      </Flex>

      <Flex justify="end">
        <span class="cart__order-line" :style="{ fontSize: '0.75rem' }"
          >inkl. mva.</span
        ></Flex
      >

      <Button
        variant="primary"
        label="Betal med"
        @click="handleVippsClick"
        class="cart__vipps-button"
        :promise="vippsbuttonPromise"
      >
        <template #icon-right>
          <img
            alt="vipps-ikon"
            src="https://assets.kvass.no/6946e51ef947328eefe07f11"
          />
        </template>
      </Button>

      <Button
        class="secondary-button"
        variant="secondary"
        label="Fortsett å handle"
        @click="goToShop"
      />

      <div class="cart__big-order">
        <img
          class="cart__info-icon"
          src="https://assets.kvass.no/693ab3690e3a17d84e5700dd"
          alt="info-ikon"
        />

        <div class="cart__big-order-flex">
          <span
            class="cart__big-order-title"
            :style="{ fontSize: '0.75rem', color: '#64748B' }"
            >Ønsker du en større bestilling?
          </span>
          <span :style="{ fontSize: '0.75rem', color: '#64748B' }"
            >Vil du kjøpe mer enn 40 stk sjokolader ta kontakt med oss.
          </span>
          <a
            href="mailto:freia@pulse.no"
            :style="{ fontSize: '0.75rem', color: '#E2001A' }"
          >
            freia@pulse.no
          </a>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="cart cart__empty-cart">
    <img
      src="https://assets.kvass.no/69414d8356b728f9da357733"
      alt="handlekurv"
      width="130px"
    />
    <h3>Handlekurven er tom</h3>

    <p :style="{ fontWeight: '300' }">Legg til sjokolade for å komme i gang!</p>

    <Button
      variant="primary"
      class="continue-button"
      label="Fortsett å handle"
      @click="goToShop"
    />
  </div>
</template>

<style lang="scss">
@import '@kvass/ui/style.css';

@font-face {
  font-family: 'Cupcake';
  src: url('@/assets/Cupcake.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'FSMe';
  src: url('@/assets/FSMe-light.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'FSMe';
  src: url('@/assets/FSMe.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'FSMe';
  src: url('@/assets/FSMe-bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

.cart {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;

  $primary: #ff5b24;
  --k-button-primary-background: #{$primary};
  --k-button-primary-background-hover: #eb4f1b;
  --k-button-secondary-background-hover: rgba(237, 199, 0, 0.1);

  $breakpoint: 1024px;

  @media (max-width: $breakpoint) {
    grid-template-columns: 1fr;
  }

  h1,
  h2,
  h3 {
    font-family: 'Cupcake', sans-serif;
    color: #8f4628;
    margin: 0;
  }

  p,
  span {
    font-family: 'FSMe', sans-serif;
    font-weight: 400;
    margin: 0;
  }

  &__empty-cart {
    margin-top: 1rem;

    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1),
      0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 2rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  &__products {
    margin-top: 1rem;

    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1),
      0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 1.5rem;

    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__delete-cart {
    @media (max-width: $breakpoint) {
      display: none;
    }
  }

  &__product {
    display: flex;
    justify-content: space-between;

    padding: 1.125rem;

    background-color: #fffdf4;
    border: 2px solid rgba(199, 165, 0, 0.5);

    border-radius: 14px;
  }

  &__product-content {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 0.2rem;
    text-align: start;
  }

  &__product-title {
    font-weight: bold;
  }

  &__product-meta {
    color: #64748b;
    font-size: 0.875rem;
  }

  &__product-price {
    color: #8f4628;
  }

  &__number-input {
    margin-top: 0.5rem;
  }

  &__product-actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
  }

  &__product-delete {
    background: none;
    border: none;
    cursor: pointer;
    color: #e31c22;
    font-size: 1.2rem;
  }

  &__product-total {
    font-weight: bold;
    font-size: 1.1rem;
    white-space: nowrap;
  }

  &__summary {
    margin-top: 1rem;
    text-align: start;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1),
      0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    height: fit-content;

    h3 {
      margin-bottom: 1rem;
    }

    button {
      margin-top: 1rem;
    }

    .k-flex {
      margin-bottom: 1rem;
    }
  }

  &__disclaimer {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 0.75rem;

    border-radius: 14px;
    padding: 0.5rem;

    border: 2px solid rgba(199, 165, 0, 0.3);
    background-color: rgba(255, 252, 233, 0.3);

    @media (max-width: $breakpoint) {
      justify-content: start;
    }
  }

  &__big-order {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 0.5rem;

    margin-top: 1rem;
    border-radius: 14px;
    padding: 0.5rem;

    border: 2px solid rgba(199, 165, 0, 0.3);
    background-color: rgba(255, 252, 233, 0.3);
  }

  &__big-order-title {
    @media (max-width: $breakpoint) {
      font-size: 0.875rem;
    }
  }

  &__big-order-flex {
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;
    text-align: start;
  }

  &__info-disclaimer {
    width: 34px;
    height: 34px;
  }

  &__info-icon {
    width: 24px;
    height: 24px;
  }

  &__order-line {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 300 !important;
  }

  &__vipps-button {
    .k-button__content {
      align-items: end;
      gap: 0.5rem;
    }
  }
}

.btn-reset {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.k-button {
  width: 100%;
  max-width: 400px;
  display: block;
  margin: auto;
}

.k-button__content {
  justify-content: center;
}

.secondary-button {
  border: 2px solid rgba(199, 165, 0, 0.3);
  color: #5d5d5d;

  .k-button__content {
    justify-content: start;
  }
}

.continue-button {
  background-color: #e2001a;
  max-width: 250px;
  margin-top: 1rem;

  &:hover {
    background-color: #9e0122 !important;
    color: #ffffff;
    outline: 2px solid #e3001a;
    outline-offset: -2px;
  }
}
</style>
