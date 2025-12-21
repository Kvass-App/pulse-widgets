import { defineCustomElement } from 'vue'
import Confirmation from './components/Confirmation.ce.vue'

customElements.define(
  'packtivation-confirmation',
  defineCustomElement(Confirmation),
)
