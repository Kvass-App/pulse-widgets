<script setup>
const props = defineProps({ units: Number })

const emit = defineEmits(['update', 'decrement', 'increment'])
</script>

<template>
  <div class="numberinput">
    <button
      @click="$emit('decrement')"
      class="numberinput__decrement btn-reset"
      :style="{ color: 'rgba(143, 70, 40, 0.5)' }"
    >
      <span>−</span>
    </button>
    <input
      type="number"
      inputmode="numeric"
      class="numberinput__input"
      name="custom-input-number"
      :value="units"
      @input="$emit('update', $event.target.value)"
      min="0"
    />
    <button
      @click="$emit('increment')"
      class="numberinput__increment btn-reset"
      :style="{ color: 'rgba(143, 70, 40, 0.5)' }"
    >
      <span>+</span>
    </button>
  </div>
</template>

<style lang="scss">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.numberinput {
  width: 125px;
  height: 50px;

  display: flex;
  justify-content: center;
  border: 2px solid rgba(199, 165, 0, 0.5);
  border-radius: 10px;

  &__input {
    width: 45%;
    font-weight: 600;
    text-align: center;
    font-size: 1.125rem;
    color: #64748b;

    border-left: 2px solid rgba(199, 165, 0, 0.5);
    border-right: 2px solid rgba(199, 165, 0, 0.5);
    border-top: transparent;
    border-bottom: transparent;
  }

  &__decrement {
    width: 40%;
    font-weight: 500;
    font-size: 1.5rem;
    cursor: pointer;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;

    &:active {
      background-color: rgba(237, 199, 0, 0.1);
    }
  }

  &__increment {
    width: 40%;
    font-weight: 500;
    font-size: 1.5rem;
    cursor: pointer;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;

    &:active {
      background-color: rgba(237, 199, 0, 0.1);
    }
  }
}
</style>
