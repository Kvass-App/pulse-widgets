const convertOrderLines = (cartItems) => {
  const TAX_RATE = 2500

  const orderLines = cartItems.map((item) => {
    const priceInOre = item.price * 100
    const totalAmount = priceInOre * item.quantity
    const totalAmountExcludingTax = totalAmount / 1.25
    const totalTaxAmount = totalAmount - totalAmountExcludingTax

    return {
      name: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${
        item.category.charAt(0).toUpperCase() + item.category.slice(1)
      } - ${item.message.charAt(0).toUpperCase() + item.message.slice(1)}`,
      id: item.id,
      totalAmount,
      totalAmountExcludingTax,
      totalTaxAmount,
      taxRate: TAX_RATE,
      unitInfo: {
        unitPrice: priceInOre,
        quantity: String(item.quantity),
        quantityUnit: 'PCS',
      },
    }
  })

  return orderLines
}

export function buildVippsOrderLines(cartItems) {
  const orderLines = convertOrderLines(cartItems)

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.price * 100 * item.quantity,
    0,
  )

  return {
    transaction: {
      amount: {
        value: itemsTotal,
        currency: 'NOK',
      },
      paymentDescription: 'Personlig Freia sjokolade',
      orderSummary: {
        orderLines,
        orderBottomLine: {
          currency: 'NOK',
        },
      },
    },
  }
}
