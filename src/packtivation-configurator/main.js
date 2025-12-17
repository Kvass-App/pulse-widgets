import { defineCustomElement } from 'vue'
import Configurator from './components/Configurator.ce.vue'

customElements.define(
  'packtivation-configurator',
  defineCustomElement(Configurator),
)
