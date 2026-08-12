export type Product = {
  id: number
  nombre: string
  precio_usd: number
  cantidad: number
  porcentaje: number
  tasa: number
  precio_bs: number
  valor_mas_porcentaje: number
  valor_final_unidad_bs: number
  valor_final_unidad_usd: number
  created_at: string
}

/** Campos que el usuario ingresa manualmente. */
export type ProductInput = {
  nombre: string
  precio_usd: number
  cantidad: number
  porcentaje: number
  tasa: number
}

/** Campos derivados: nunca los escribe el usuario. */
export type DerivedValues = {
  precio_bs: number
  valor_mas_porcentaje: number
  valor_final_unidad_bs: number
  valor_final_unidad_usd: number
}

/** Entrada mínima para calcular los derivados. */
export type CalcInput = {
  precio_usd: number
  cantidad: number
  porcentaje: number
  tasa: number
}

export type ActionErrorCode = "VALIDATION" | "DUPLICATE" | "NOT_FOUND" | "UNKNOWN"

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ActionErrorCode; fieldErrors?: Record<string, string> }

/** Errores de validación por campo, para pintarlos debajo de cada input. */
export type FieldErrors = Partial<Record<keyof ProductInput, string>>
