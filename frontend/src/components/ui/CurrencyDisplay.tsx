interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'teal' | 'green' | 'orange' | 'red';
  showSign?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl font-bold',
};

const colorStyles: Record<string, string> = {
  default: 'text-[#2D3748]',
  teal: 'text-[#16a34a]',
  green: 'text-green-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
};

const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function CurrencyDisplay({
  amount,
  currency = 'INR',
  size = 'md',
  color = 'default',
  showSign = false,
}: CurrencyDisplayProps) {
  const symbol = currencySymbols[currency.toUpperCase()] || currency + ' ';
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = showSign ? (amount >= 0 ? '+' : '-') : amount < 0 ? '-' : '';

  return (
    <span className={`${sizeStyles[size]} ${colorStyles[color]}`}>
      {sign}{symbol}{formatted}
    </span>
  );
}
