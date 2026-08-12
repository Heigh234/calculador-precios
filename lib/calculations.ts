import type { CalcInput, DerivedValues } from "@/lib/types"

/**
 * Lógica de negocio heredada del programa de escritorio (Qt/C++).
 * NO modificar las fórmulas: son el corazón del sistema.
 *
 *   precio_bs               = tasa * precio_usd
 *   valor_mas_porcentaje    = precio_bs incrementado en 'porcentaje' %  ->  precio_bs * (1 + porcentaje / 100)
 *   valor_final_unidad_bs   = valor_mas_porcentaje / cantidad
 *   valor_final_unidad_usd  = valor_final_unidad_bs / tasa
 */

/** Normaliza cualquier valor a un número finito; NaN / Infinity / null -> 0. */
export function toFiniteNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/** Redondea a 4 decimales (precisión de las columnas numeric de Postgres). */
export function round4(value: number): number {
  if (!Number.isFinite(value)) return 0
  const rounded = Math.round(value * 10000) / 10000
  return Object.is(rounded, -0) ? 0 : rounded
}

/**
 * Calcula los 4 campos derivados a partir de los 4 campos que ingresa el usuario.
 * Función pura y determinista: mismas entradas -> mismas salidas.
 *
 * Guardas:
 *  - cantidad <= 0  -> valor_final_unidad_bs = 0 y valor_final_unidad_usd = 0 (evita division por cero)
 *  - tasa <= 0      -> valor_final_unidad_usd = 0
 *  - cualquier resultado no finito -> 0
 */
export function calculateDerived(input: CalcInput): DerivedValues {
  const precio_usd = toFiniteNumber(input.precio_usd)
  const cantidad = toFiniteNumber(input.cantidad)
  const porcentaje = toFiniteNumber(input.porcentaje)
  const tasa = toFiniteNumber(input.tasa)

  // 1. Precio (Bs) = Tasa * Precio ($)
  const precio_bs = tasa * precio_usd

  // 2. Valor mas el % = Precio (Bs) INCREMENTADO en el porcentaje (no una suma del numero)
  const valor_mas_porcentaje = precio_bs * (1 + porcentaje / 100)

  // 3. Valor Final por Unidad (Bs) = Valor mas el % / Cantidad
  const valor_final_unidad_bs = cantidad > 0 ? valor_mas_porcentaje / cantidad : 0

  // 4. Valor Final por Unidad ($) = Valor Final por Unidad (Bs) / Tasa
  const valor_final_unidad_usd = tasa > 0 ? valor_final_unidad_bs / tasa : 0

  return {
    precio_bs: round4(precio_bs),
    valor_mas_porcentaje: round4(valor_mas_porcentaje),
    valor_final_unidad_bs: round4(valor_final_unidad_bs),
    valor_final_unidad_usd: round4(valor_final_unidad_usd),
  }
}

/**
 * Devuelve la fila completa (entradas + derivados) lista para persistir.
 * Se usa al crear, al editar y al aplicar la tasa global.
 */
export function withDerived<T extends CalcInput>(input: T): T & DerivedValues {
  return { ...input, ...calculateDerived(input) }
}

/** Reemplaza la tasa de un producto y recalcula todo (usado por la Tasa Global). */
export function applyRate<T extends CalcInput>(input: T, tasa: number): T & DerivedValues {
  const next = { ...input, tasa: toFiniteNumber(tasa) }
  return { ...next, ...calculateDerived(next) }
}
