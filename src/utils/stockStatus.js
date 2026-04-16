export function stockStatus(quantity = 0, lowThreshold = 10) {
  if (quantity <= 0) {
    return { label: 'Out of stock', color: 'danger', level: 'out' }
  }

  if (quantity <= lowThreshold) {
    return { label: 'Low stock', color: 'warning', level: 'low' }
  }

  return { label: 'In stock', color: 'success', level: 'ok' }
}
