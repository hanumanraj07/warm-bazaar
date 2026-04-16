const formatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

export function formatINR(amount = 0) {
  const safeAmount = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0
  const prefix = safeAmount < 0 ? '-₹' : '₹'
  return `${prefix}${formatter.format(Math.abs(safeAmount))}`
}
