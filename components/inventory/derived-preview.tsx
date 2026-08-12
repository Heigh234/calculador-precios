import { Separator } from "@/components/ui/separator"
import { formatBs, formatUsd } from "@/lib/format"
import type { DerivedValues } from "@/lib/types"

type DerivedPreviewProps = {
  derived: DerivedValues
}

export function DerivedPreview({ derived }: DerivedPreviewProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Valores calculados
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Precio (Bs)</dt>
        <dd className="num text-right text-foreground">{formatBs(derived.precio_bs)}</dd>

        <dt className="text-muted-foreground">Valor más el %</dt>
        <dd className="num text-right text-foreground">{formatBs(derived.valor_mas_porcentaje)}</dd>

        <Separator className="col-span-2" />

        <dt className="font-medium text-foreground">Valor Final por Unidad (Bs)</dt>
        <dd className="num text-right font-medium text-foreground">
          {formatBs(derived.valor_final_unidad_bs)}
        </dd>

        <dt className="text-muted-foreground">Valor Final por Unidad ($)</dt>
        <dd className="num text-right text-foreground">{formatUsd(derived.valor_final_unidad_usd)}</dd>
      </dl>
    </div>
  )
}
