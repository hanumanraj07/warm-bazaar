import { formatINR } from './formatINR'
import { formatDate, formatTime, isSameDay } from './formatDate'
import { stockStatus } from './stockStatus'

export { formatINR, formatDate, formatTime, isSameDay, stockStatus }

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function stringToColor(value = '') {
  const palette = ['#1B4332', '#2D6A4F', '#F4A261', '#E76F51', '#2A9D8F', '#355070', '#B56576']
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}
