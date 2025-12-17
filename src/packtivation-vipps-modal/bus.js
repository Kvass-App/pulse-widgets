import mitt from 'mitt'

window.bus = window.bus || mitt()

export const bus = window.bus
