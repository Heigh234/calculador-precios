"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { updateProduct } from "@/app/actions/products"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DerivedPreview } from "@/components/inventory/derived-preview"
import {
  ProductFormFields,
  type ProductFormValues,
} from "@/components/inventory/product-form-fields"
import { calculateDerived } from "@/lib/calculations"
import { parseOptionalNumberField, validateProductInput } from "@/lib/validation"
import type { FieldErrors, Product } from "@/lib/types"

function productToFormValues(product: Product): ProductFormValues {
  return {
    nombre: product.nombre,
    precio_usd: String(product.precio_usd),
    cantidad: String(product.cantidad),
    porcentaje: String(product.porcentaje),
    tasa: String(product.tasa),
  }
}

type EditProductDialogProps = {
  product: Product | null
  onOpenChange: (open: boolean) => void
  onUpdated: (product: Product) => void
}

export function EditProductDialog({ product, onOpenChange, onUpdated }: EditProductDialogProps) {
  const [values, setValues] = useState<ProductFormValues | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (product) {
      setValues(productToFormValues(product))
      setErrors({})
    }
  }, [product])

  const preview = useMemo(() => {
    if (!values) return null
    return calculateDerived({
      precio_usd: parseOptionalNumberField(values.precio_usd) ?? 0,
      cantidad: parseOptionalNumberField(values.cantidad) ?? 0,
      porcentaje: parseOptionalNumberField(values.porcentaje) ?? 0,
      tasa: parseOptionalNumberField(values.tasa) ?? 0,
    })
  }, [values])

  function handleClose() {
    setValues(null)
    setErrors({})
    onOpenChange(false)
  }

  function handleSubmit() {
    if (!product || !values) return

    const parsed = validateProductInput({
      nombre: values.nombre,
      precio_usd: parseOptionalNumberField(values.precio_usd) ?? undefined,
      cantidad: parseOptionalNumberField(values.cantidad) ?? undefined,
      porcentaje: parseOptionalNumberField(values.porcentaje) ?? undefined,
      tasa: parseOptionalNumberField(values.tasa) ?? undefined,
    })

    if (!parsed.ok) {
      setErrors(parsed.errors)
      return
    }
    setErrors({})

    startTransition(async () => {
      const res = await updateProduct(product.id, parsed.value)
      if (res.ok) {
        onUpdated(res.data)
        toast.success("Producto actualizado")
        handleClose()
        return
      }

      if (res.code === "VALIDATION" && res.fieldErrors) {
        setErrors(res.fieldErrors)
        return
      }

      toast.error(res.error)
    })
  }

  return (
    <Dialog
      open={product !== null}
      onOpenChange={(next) => {
        if (!next) handleClose()
        else onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>

        {values && (
          <>
            <ProductFormFields
              idPrefix="edit"
              values={values}
              onChange={setValues}
              errors={errors}
            />

            {preview && <DerivedPreview derived={preview} />}
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending || !values}>
            {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
