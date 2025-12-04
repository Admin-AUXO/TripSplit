export const CURRENCY_SYMBOL = '₹'
export const CURRENCY_CODE = 'INR'

export const formatCurrency = (amount) => {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}

export const formatCurrencyWithoutSymbol = (amount) => {
  return amount.toFixed(2)
}

