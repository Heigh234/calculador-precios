"use client"

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { FieldErrors } from "@/lib/types"

export type ProductFormValues = {
  nombre: string
  precio_usd: string
  cantidad: string
  porcentaje: string
  tasa: string
}

type ProductFormFieldsProps = {
  values: ProductFormValues
  onChange: (values: ProductFormValues) => void
  errors?: FieldErrors
  idPrefix: string
}

export function ProductFormFields({ values, onChange, errors, idPrefix }: ProductFormFieldsProps) {
  function set<K extends keyof ProductFormValues>(key: K, value: string) {
    onChange({ ...values, [key]: value })
  }

  return (
    <FieldGroup>
      <Field data-invalid={Boolean(errors?.nombre)}>
        <FieldLabel htmlFor={`${idPrefix}-nombre`}>Nombre</FieldLabel>
        <Input
          id={`${idPrefix}-nombre`}
          value={values.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          aria-invalid={Boolean(errors?.nombre)}
          aria-describedby={errors?.nombre ? `${idPrefix}-nombre-error` : undefined}
          placeholder="Ej: Harina de maíz"
          autoComplete="off"
        />
        {errors?.nombre && (
          <FieldError id={`${idPrefix}-nombre-error`}>{errors.nombre}</FieldError>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={Boolean(errors?.precio_usd)}>
          <FieldLabel htmlFor={`${idPrefix}-precio_usd`}>Precio ($)</FieldLabel>
          <Input
            id={`${idPrefix}-precio_usd`}
            className="num"
            inputMode="decimal"
            step="any"
            value={values.precio_usd}
            onChange={(e) => set("precio_usd", e.target.value)}
            aria-invalid={Boolean(errors?.precio_usd)}
            aria-describedby={errors?.precio_usd ? `${idPrefix}-precio_usd-error` : undefined}
            placeholder="0.00"
          />
          {errors?.precio_usd && (
            <FieldError id={`${idPrefix}-precio_usd-error`}>{errors.precio_usd}</FieldError>
          )}
        </Field>

        <Field data-invalid={Boolean(errors?.cantidad)}>
          <FieldLabel htmlFor={`${idPrefix}-cantidad`}>Cantidad (Stock)</FieldLabel>
          <Input
            id={`${idPrefix}-cantidad`}
            className="num"
            inputMode="decimal"
            step="any"
            value={values.cantidad}
            onChange={(e) => set("cantidad", e.target.value)}
            aria-invalid={Boolean(errors?.cantidad)}
            aria-describedby={errors?.cantidad ? `${idPrefix}-cantidad-error` : undefined}
            placeholder="0"
          />
          {errors?.cantidad && (
            <FieldError id={`${idPrefix}-cantidad-error`}>{errors.cantidad}</FieldError>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={Boolean(errors?.porcentaje)}>
          <FieldLabel htmlFor={`${idPrefix}-porcentaje`}>Porcentaje (%)</FieldLabel>
          <Input
            id={`${idPrefix}-porcentaje`}
            className="num"
            inputMode="decimal"
            step="any"
            value={values.porcentaje}
            onChange={(e) => set("porcentaje", e.target.value)}
            aria-invalid={Boolean(errors?.porcentaje)}
            aria-describedby={errors?.porcentaje ? `${idPrefix}-porcentaje-error` : undefined}
            placeholder="0"
          />
          {errors?.porcentaje && (
            <FieldError id={`${idPrefix}-porcentaje-error`}>{errors.porcentaje}</FieldError>
          )}
        </Field>

        <Field data-invalid={Boolean(errors?.tasa)}>
          <FieldLabel htmlFor={`${idPrefix}-tasa`}>Tasa</FieldLabel>
          <Input
            id={`${idPrefix}-tasa`}
            className="num"
            inputMode="decimal"
            step="any"
            value={values.tasa}
            onChange={(e) => set("tasa", e.target.value)}
            aria-invalid={Boolean(errors?.tasa)}
            aria-describedby={errors?.tasa ? `${idPrefix}-tasa-error` : undefined}
            placeholder="0.00"
          />
          {errors?.tasa && <FieldError id={`${idPrefix}-tasa-error`}>{errors.tasa}</FieldError>}
        </Field>
      </div>
    </FieldGroup>
  )
}
