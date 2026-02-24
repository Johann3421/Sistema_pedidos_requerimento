import Badge from '../ui/Badge';
import { ESTADOS } from '../../utils/constants';

export default function EstadoBadge({ estado }) {
  const config = ESTADOS[estado] || { label: estado, color: '#666', bg: '#eee' };
  return <Badge color={config.color} bg={config.bg}>{config.label}</Badge>;
}
