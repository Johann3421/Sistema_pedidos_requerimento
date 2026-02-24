import { useState } from 'react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="hidden sm:flex items-center gap-2">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
        title="Moneda"
      >
        <option value="PEN">PEN (S/)</option>
        <option value="USD">USD ($)</option>
      </select>
    </div>
  );
}
