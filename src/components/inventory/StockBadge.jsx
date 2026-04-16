import Badge from '../ui/Badge'
import { stockStatus } from '../../utils/helpers'

export default function StockBadge({ quantity, unit, lowThreshold }) {
  const status = stockStatus(quantity, lowThreshold)

  return (
    <Badge color={status.level === 'ok' ? 'success' : status.color}>
      {quantity} {unit}
    </Badge>
  )
}
