// lib/utils/currency.ts

export const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  USD: { symbol: '$', label: 'US Dollar' },
  EUR: { symbol: '€', label: 'Euro' },
  GBP: { symbol: '£', label: 'British Pound' },
  NGN: { symbol: '₦', label: 'Nigerian Naira' },
  CAD: { symbol: 'CA$', label: 'Canadian Dollar' },
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES[code]?.symbol || code
}

// Determines the effective currency for a product:
// category override wins if set, otherwise falls back to the global default
export function resolveCurrency(
  categoryOverride: string | null | undefined,
  globalDefault: string
): string {
  return categoryOverride || globalDefault
}

export function formatPrice(
  amount: number,
  currencyCode: string
): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${amount.toFixed(2)}`
}