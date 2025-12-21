<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { Icon, Button, Input, Dialog } from '@kvass/ui'

const handleClick = () => {
  window.location.href = '/bestill-sjokolade'
}
</script>

<template>
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

      <span class="confirmation__order-number-font">#ORD11524203</span>
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
</style>
