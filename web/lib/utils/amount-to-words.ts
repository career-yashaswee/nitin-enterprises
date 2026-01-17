import { ToWords } from 'to-words';

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

/**
 * Converts a number to words in Indian numbering system
 * Supports amounts up to 99,99,99,999.99
 */
export function amountToWords(amount: number): string {
  if (amount === 0) return "Zero Rupees Only";

  try {
    const words = toWords.convert(amount, {
      currency: true,
    });
    return words + " Only";
  } catch {
    // Fallback for very large numbers
    return `${amount.toFixed(2)} Rupees Only`;
  }
}
