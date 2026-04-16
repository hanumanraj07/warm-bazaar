export function formatDate(date, options = {}) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function isSameDay(date, comparisonDate = new Date()) {
  const left = new Date(date)
  const right = new Date(comparisonDate)
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  )
}
