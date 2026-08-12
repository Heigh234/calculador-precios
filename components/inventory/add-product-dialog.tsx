"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { createProduct } from "@/app/actions/products"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

const EMPTY_FORM: ProductFormValues = {
  nombre: "",
  precio_usd: "",
  cantidad: "",
  porcentaje: "",
  tasa: "",
}

type AddProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (product: Product) => void
}

export function AddProductDialog({ open, onOpenChange, onCreated }: AddProductDialogProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const preview = useMemo(
    () =>
      calculateDerived({
        precio_usd: parseOptionalNumberField(values.precio_usd) ?? 0,
        cantidad: parseOptionalNumberField(values.cantidad) ?? 0,
        porcentaje: parseOptionalNumberField(values.porcentaje) ?? 0,
        tasa: parseOptionalNumberField(values.tasa) ?? 0,
      }),
    [values],
  )

  function resetAndClose() {
    setValues(EMPTY_FORM)
    setErrors({})
    setDuplicateWarning(null)
    onOpenChange(false)
  }

  function submit(force: boolean) {
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
      const res = await createProduct(parsed.value, { force })
      if (res.ok) {
        onCreated(res.data)
        toast.success("Producto agregado")
        resetAndClose()
        return
      }

      if (res.code === "DUPLICATE") {
        setDuplicateWarning(res.error)
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
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) resetAndClose()
          else onOpenChange(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
          </DialogHeader>

          <ProductFormFields
            idPrefix="add"
            values={values}
            onChange={setValues}
            errors={errors}
          />

          <DerivedPreview derived={preview} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => submit(false)} disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={duplicateWarning !== null} onOpenChange={(next) => !next && setDuplicateWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Producto duplicado</AlertDialogTitle>
            <AlertDialogDescription>{duplicateWarning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                setDuplicateWarning(null)
                submit(true)
              }}
            >
              {isPending ? "Agregando…" : "Agregar de todas formas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
