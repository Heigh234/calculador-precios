"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { applyGlobalRate } from "@/app/actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { parseNumberField } from "@/lib/validation"

type GlobalRateBarProps = {
  productCount: number
}

export function GlobalRateBar({ productCount }: GlobalRateBarProps) {
  const [rawValue, setRawValue] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const parsedTasa = parseNumberField(rawValue)
  const isValid = parsedTasa !== null && parsedTasa > 0

  function handleSubmit() {
    if (!isValid) {
      toast.error("Ingresa una tasa global válida, mayor que 0.")
      return
    }
    setConfirmOpen(true)
  }

  function handleConfirm() {
    if (!isValid || parsedTasa === null) return
    startTransition(async () => {
      const res = await applyGlobalRate(parsedTasa)
      setConfirmOpen(false)
      if (res.ok) {
        toast.success(`Tasa global aplicada a ${res.data.updated} productos`)
        setRawValue("")
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="flex items-end gap-2 rounded-md border border-accent/40 bg-accent/10 p-3">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="tasa-global" className="text-xs font-medium uppercase tracking-wide">
          Tasa Global
        </Label>
        <Input
          id="tasa-global"
          type="text"
          inputMode="decimal"
          placeholder="Ej: 40.00"
          value={rawValue}
          onChange={(e) => setRawValue(e.target.value)}
          className="num bg-background"
        />
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || rawValue.trim() === ""}
        className="bg-accent text-accent-foreground hover:bg-accent/80"
      >
        Aplicar a todos
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar tasa global</AlertDialogTitle>
            <AlertDialogDescription>
              Esto sobrescribirá la tasa de los {productCount}{" "}
              {productCount === 1 ? "producto" : "productos"} del inventario. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Aplicando…" : "Continuar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
