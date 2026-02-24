import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCurrencyStore } from '../store/currencyStore';

export function formatCurrency(value, currency) {
  const num = parseFloat(value) || 0;
  const storeCurrency = useCurrencyStore.getState().currency || 'PEN';
  const curr = currency || storeCurrency || 'PEN';
  const locale = curr === 'USD' ? 'en-US' : 'es-PE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr === 'PEN' ? 'PEN' : curr,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date) {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy', { locale: es });
  } catch {
    return date;
  }
}

export function formatDateTime(date) {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return date;
  }
}

export function formatRelativeDate(date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
  } catch {
    return date;
  }
}

export function formatFullDate() {
  return format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
