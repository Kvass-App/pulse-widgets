import { defineCustomElement } from 'vue'
import Checkout from './components/Checkout.ce.vue'

customElements.define('packtivation-checkout', defineCustomElement(Checkout))
