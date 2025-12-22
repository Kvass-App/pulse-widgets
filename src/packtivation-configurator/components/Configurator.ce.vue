<script setup>
import { ref, computed, reactive, watch, onMounted, nextTick } from 'vue'
import { Icon, Button, Input, Flex } from '@kvass/ui'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import { TYPES, CATEGORIES, PRODUCTS } from '../constants'
import NumberInput from './NumberInput.ce.vue'

const config = {
  wrapAround: true,
  snapAlign: 'start',
  mouseDrag: false,
  touchDrag: true,
}

const selectedType = ref('melkesjokolade')
const selectedCategory = ref('')
const addToCartPromise = ref()

const shoppingCart = ref(
  JSON.parse(localStorage.getItem('freia-shopping-cart') || '[]'),
)
const currentSlide = ref(0)
const quantity = ref(1)

const filteredProducts = computed(() => {
  return PRODUCTS.filter(
    (p) =>
      p.type === selectedType.value && p.category === selectedCategory.value,
  )
})

const currentProduct = computed(() => {
  return filteredProducts.value[currentSlide.value]
})

const selectCategory = (id) => {
  selectedCategory.value = id
  currentSlide.value = 0
}

const prev = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    const currentCategoryIndex = CATEGORIES.findIndex(
      (c) => c.id === selectedCategory.value,
    )
    const newCategoryIndex =
      currentCategoryIndex > 0
        ? currentCategoryIndex - 1
        : CATEGORIES.length - 1

    selectedCategory.value = CATEGORIES[newCategoryIndex].id

    nextTick(() => {
      currentSlide.value = filteredProducts.value.length - 1
    })
  }
}

const next = () => {
  if (currentSlide.value < filteredProducts.value.length - 1) {
    currentSlide.value++
  } else {
    const currentCategoryIndex = CATEGORIES.findIndex(
      (c) => c.id === selectedCategory.value,
    )
    const newCategoryIndex =
      currentCategoryIndex < CATEGORIES.length - 1
        ? currentCategoryIndex + 1
        : 0

    selectedCategory.value = CATEGORIES[newCategoryIndex].id
    currentSlide.value = 0
  }
}

const addToCart = () => {
  addToCartPromise.value = new Promise((resolve) => {
    if (!currentProduct.value) return resolve()

    const existing = shoppingCart.value.find(
      (item) => item.id === currentProduct.value.id,
    )

    if (existing) {
      existing.quantity += quantity.value
    } else {
      shoppingCart.value.push({
        ...currentProduct.value,
        quantity: quantity.value,
      })
    }

    resolve()
  })
}

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
  <div class="configurator">
    <div>
      <h3>Steg 1: Velg smak</h3>

      <div class="configurator__type-selection">
        <div
          v-for="type in TYPES"
          :key="type.id"
          @click="selectedType = type.id"
          class="configurator__type-card"
          :class="{
            'configurator__type-card--active': selectedType === type.id,
          }"
        >
          <img
            class="configurator__type-card-image"
            :src="type.image"
            :alt="type.label"
          />

          <p
            class="configurator__fsme-bold"
            :style="{ 'font-weight': '700', 'margin-bottom': '0.5rem' }"
          >
            {{ type.label }}
          </p>

          <Flex align="center" gap="0.25rem">
            <img
              src="https://assets.kvass.no/693887a24a6bbc745f6a1d7f"
              alt="label-ikon"
              :style="{ width: '12px', height: '12px' }"
            />
            <p :style="{ color: '#939393', 'font-weight': '500' }">
              {{
                `${type.price.toLocaleString('nb-NO', {
                  minimumFractionDigits: 2,
                })} kr`
              }}
            </p>
          </Flex>

          <img
            class="configurator__type-card-checkbox"
            src="https://assets.kvass.no/69386c2a4a6bbc745f69f875"
            alt="checkmark"
          />
        </div>
      </div>
    </div>

    <div>
      <h3>Steg 2: Velg kategori</h3>

      <div class="configurator__category-selection">
        <div
          v-for="category in CATEGORIES"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="configurator__category-card"
          :class="{
            'configurator__category-card--active':
              selectedCategory === category.id,
          }"
        >
          <Flex align="center" gap="0.4rem">
            <img :src="category.icon" />
            <p :style="{ 'font-weight': '300' }">
              {{ category.label }} ({{ category.count }})
            </p>
          </Flex>
        </div>
      </div>
    </div>

    <div
      v-if="!selectedType || !selectedCategory"
      class="configurator__product-selection-empty"
    >
      <h3>Steg 3: Velg budskap</h3>

      <picture>
        <source
          media="(max-width: 1024px)"
          srcset="https://assets.kvass.no/693968c18e71ee11b9339837"
        />
        <img
          src="https://assets.kvass.no/693967ea8e71ee11b93397b1"
          alt="budskap-placeholder"
        />
      </picture>
    </div>

    <div v-else class="configurator__product-selection">
      <h3>
        Steg 3: Bla gjennom alternativene med pilene og velg ønsket budskap
      </h3>

      <Carousel
        v-bind="config"
        v-model="currentSlide"
        class="configurator__carousel-parent"
        :itemsToShow="1"
        aria-label="Bildekarusell"
        v-if="filteredProducts.length"
      >
        <Slide
          v-for="(slide, index) in filteredProducts"
          :key="slide.id"
          class="configurator__carousel-slide"
        >
          <img :src="slide.image" class="configurator__carousel-image" />

          <div class="configurator__carousel-info">
            <h3 class="configurator__carousel-title">
              {{ slide.message }}
            </h3>
            <p class="configurator__carousel-count">
              Budskap {{ index + 1 }} av {{ filteredProducts.length }}
            </p>
          </div>
        </Slide>
      </Carousel>

      <div class="configurator__carousel-controls">
        <button @click="prev" class="configurator__carousel-btn btn-reset">
          <span
            class="configurator__carousel-icon configurator__carousel-icon--prev"
          ></span>
        </button>

        <div class="configurator__carousel-dots">
          <span
            v-for="(slide, index) in filteredProducts"
            :key="index"
            :class="[
              'configurator__dot',
              { 'configurator__dot--active': index === currentSlide },
            ]"
            @click="currentSlide = index"
          />
        </div>

        <span class="configurator__swipe-hint">Sveip eller trykk pilene</span>

        <button @click="next" class="configurator__carousel-btn btn-reset">
          <span
            class="configurator__carousel-icon configurator__carousel-icon--next"
          ></span>
        </button>
      </div>

      <div class="configurator__cart-bar">
        <div class="configurator__cart-bar-price">
          <div class="configurator__cart-bar-flex">
            <span class="configurator__cart-bar-amount"
              >{{
                currentProduct?.price.toLocaleString('nb-NO', {
                  minimumFractionDigits: 2,
                })
              }}
              kr</span
            >
            <span :style="{ 'font-weight': '300' }">per plate</span>
          </div>
          <span :style="{ 'font-weight': '300' }">inkl. mva.</span>
        </div>

        <div class="configurator__cart-bar-quantity">
          <span :style="{ fontSize: '1rem', color: '#64748B' }">Antall:</span>
          <NumberInput
            :units="quantity"
            @update="(val) => (quantity = Math.max(1, parseInt(val) || 1))"
            @decrement="quantity > 1 && quantity--"
            @increment="quantity++"
          />
        </div>

        <Button
          variant="primary"
          class="configurator__cart-bar-submit"
          icon="fa-pro-light:cart-shopping"
          label="Legg i handlekurv"
          @click="addToCart"
          :promise="addToCartPromise"
          :state-timeout="1500"
        ></Button>
      </div>

      <div class="configurator__big-order">
        <img
          class="configurator__info-icon"
          src="https://assets.kvass.no/693ab3690e3a17d84e5700dd"
          alt="info-ikon"
        />

        <div class="configurator__big-order-flex">
          <span
            class="configurator__big-order-title"
            :style="{ fontSize: '0.75rem', color: '#64748B' }"
            >Ønsker du en større bestilling?</span
          >
          <span :style="{ fontSize: '0.75rem', color: '#64748B' }"
            >Vil du kjøpe mer enn 40 stk sjokolader ta kontakt med oss.</span
          >
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
</template>

<style lang="scss">
@import '@kvass/ui/style.css';
@import 'vue3-carousel/dist/carousel.css';

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

.configurator {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 2.125rem;
  margin-top: 2rem;

  max-width: 1080px;

  text-align: left;

  --carousel-icon-color: #c7a500;

  $primary: #e2001a;
  --k-button-primary-background: #{$primary};
  --k-button-primary-background-hover: #9e0122;

  $breakpoint: 1024px;

  @media (max-width: 1024px) {
    padding: 0.8rem;
  }

  h1,
  h2,
  h3 {
    font-family: 'Cupcake', sans-serif;
    color: #8f4628;
    margin: 0;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  p,
  span {
    font-family: 'FSMe', sans-serif;
    font-weight: 400;
    margin: 0;
  }

  &__type-selection {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: $breakpoint) {
      grid-template-columns: 1fr;
      justify-self: center;
    }
  }

  &__type-card {
    border: 2px solid rgba(199, 165, 0, 0.5);
    border-radius: 14px;
    padding: 1rem;
    cursor: pointer;
    position: relative;
    max-width: 325px;

    &:hover {
      background-color: rgba(237, 199, 0, 0.1);
    }

    &--active {
      border: 3px solid #c7a500;
      background-color: rgba(237, 199, 0, 0.1);
      box-shadow: 0 4px 12px rgba(199, 165, 0, 0.3);

      .configurator__type-card-checkbox {
        width: 28px;
        height: 28px;
        position: absolute;
        top: 10px;
        right: 10px;

        display: block !important;
      }
    }
  }

  &__type-card-image {
    max-width: 100%;
  }

  .configurator__type-card-checkbox {
    display: none;
  }

  &__category-selection {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: $breakpoint) {
      flex-direction: column;
      justify-self: center;
    }
  }

  &__category-card {
    border: 2px solid rgba(199, 165, 0, 0.5);
    border-radius: 100px;
    padding: 1rem;
    cursor: pointer;

    &:hover {
      background-color: rgba(237, 199, 0, 0.1);
    }

    &--active {
      border: 3px solid #c7a500;
      background-color: rgba(237, 199, 0, 0.1);
      box-shadow: 0 4px 12px rgba(199, 165, 0, 0.3);
    }

    @media (max-width: $breakpoint) {
      padding: 0.6rem;
    }
  }

  &__product-selection-empty {
    img {
      width: 100%;
    }
  }

  &__carousel-parent {
    width: 100%;
    margin: auto;
    max-width: var(--body-max-width, 100%);
  }

  &__carousel-slide {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__carousel-image {
    width: 100%;
    max-width: var(--image-max-width-desktop, 100%);
    object-fit: contain;
    aspect-ratio: 2.27 / 1;

    background-color: #fede32;
    border-radius: 14px;
    border: 2px solid #edc700;

    @media (max-width: $breakpoint) {
      aspect-ratio: 2.24 / 1;
    }
  }

  .carousel__prev,
  .carousel__next {
    margin: 0;

    svg {
      width: 24px;
      height: 24px;
      fill: var(--icon-color, var(--carousel-icon-color));
      scale: 1.5;
    }

    &:focus-visible {
      outline: 3px solid var(--icon-color, var(--carousel-icon-color));
      outline-offset: 2px;
    }
  }

  .carousel__prev {
    margin-left: -15px;
  }

  .carousel__next {
    margin-right: -15px;
  }

  &__cart-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;

    border: 2px solid rgba(199, 165, 0, 0.5);
    border-radius: 14px;
    padding: 1.375rem;

    margin-top: 2.5rem;

    @media (max-width: $breakpoint) {
      flex-direction: column;
      align-items: start;
      gap: 1rem;
      padding: 0.75rem;
    }
  }

  &__cart-bar-price {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 0.5rem;
    padding-right: 2rem;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 75%;
      width: 1px;
      background-color: #e5e7eb;
    }

    @media (max-width: $breakpoint) {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;

      &::after {
        display: none;
      }
    }
  }

  &__cart-bar-flex {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__cart-bar-amount {
    font-size: 1.875rem;
    font-weight: 500;
    color: #c7a500;

    @media (max-width: $breakpoint) {
      font-size: 1.5rem;
    }
  }

  &__cart-bar-quantity {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__cart-bar-submit {
    margin-left: auto;
    color: white;
    border: none;
    border-radius: 100px;
    padding: 1rem 2rem;
    font-weight: bold;
    cursor: pointer;

    @media (max-width: $breakpoint) {
      align-self: center;
      margin-left: 0;
    }

    &:hover {
      color: #ffffff;
      outline: 2px solid #e3001a;
      outline-offset: -2px;
    }
  }

  &__carousel-info {
    text-align: center;
    margin-top: 1rem;

    @media (max-width: $breakpoint) {
      min-height: 7rem;
    }
  }

  &__carousel-title {
    font-family: 'Cupcake', sans-serif;
    color: #8f4628;
    font-size: 1.5rem;
    margin-bottom: 0.5rem !important;
  }

  &__carousel-count {
    color: #64748b;
    margin-bottom: 1rem !important;
    font-weight: 300 !important;

    @media (max-width: $breakpoint) {
      margin-bottom: 0;
    }
  }

  &__carousel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  &__carousel-dots {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    @media (max-width: $breakpoint) {
      display: none;
    }
  }

  &__swipe-hint {
    color: #64748b;
    font-weight: 300 !important;
    font-size: 1rem;

    @media (min-width: $breakpoint) {
      display: none;
    }
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgba(237, 199, 0, 0.3);
    cursor: pointer;
    transition: all 0.2s;

    &--active {
      width: 32px;
      border-radius: 6px;
      background: #c7a500;
    }
  }

  &__carousel-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    z-index: -1;
    background-image: url('https://assets.kvass.no/693aa04c0e3a17d84e56f0ad'),
      url('https://assets.kvass.no/693ac5380e3a17d84e570d83'),
      url('https://assets.kvass.no/693ac6970e3a17d84e570eca'),
      url('https://assets.kvass.no/693aa04e0e3a17d84e56f0b9'),
      url('https://assets.kvass.no/693ac53a0e3a17d84e570d8f'),
      url('https://assets.kvass.no/693ac6990e3a17d84e570ed6');
  }

  &__carousel-icon {
    display: block;
    width: 48px;
    height: 48px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    &--prev {
      background-image: url('https://assets.kvass.no/693aa04c0e3a17d84e56f0ad');

      &:hover {
        background-image: url('https://assets.kvass.no/693ac5380e3a17d84e570d83');
      }

      &:active {
        background-image: url('https://assets.kvass.no/693ac6970e3a17d84e570eca');
      }
    }

    &--next {
      background-image: url('https://assets.kvass.no/693aa04e0e3a17d84e56f0b9');

      &:hover {
        background-image: url('https://assets.kvass.no/693ac53a0e3a17d84e570d8f');
      }

      &:active {
        background-image: url('https://assets.kvass.no/693ac6990e3a17d84e570ed6');
      }
    }
  }

  &__big-order {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    margin-top: 1rem;
    border-radius: 14px;
    padding: 0.5rem;

    border: 2px solid rgba(199, 165, 0, 0.3);
    background-color: rgba(255, 252, 233, 0.3);

    @media (max-width: $breakpoint) {
      justify-content: start;
    }
  }

  &__big-order-title {
    @media (max-width: $breakpoint) {
      font-size: 0.875rem;
    }
  }

  &__big-order-flex {
    display: flex;
    align-items: center;
    gap: 0.2rem;

    @media (max-width: $breakpoint) {
      flex-direction: column;
      gap: 0.5rem;
      align-items: start;
    }
  }

  &__info-icon {
    width: 24px;
    height: 24px;
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
</style>
