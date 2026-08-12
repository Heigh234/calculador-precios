/**
 * Formateadores con locale FIJO (nunca el del navegador) para evitar
 * mismatches de hidratación entre servidor y cliente.
 */

const bsFormatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

export function formatBs(value: number): string {
  return `${bsFormatter.format(value)} Bs`
}

export function formatUsd(value: number): string {
  return `$${usdFormatter.format(value)}`
}

/** Para cantidad, porcentaje y tasa: sin símbolo de moneda. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
