import { PackageSearch, PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateProps =
  | { variant: "empty"; onAdd: () => void }
  | { variant: "no-results"; query: string }

export function EmptyState(props: EmptyStateProps) {
  if (props.variant === "no-results") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius)] border border-dashed border-border py-16 text-center">
        <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl text-foreground">Sin resultados</h2>
          <p className="text-sm text-muted-foreground">
            Ningún producto coincide con «{props.query}».
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius)] border border-dashed border-border py-20 text-center">
      <PackagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl text-foreground">Tu inventario está vacío</h2>
        <p className="text-sm text-muted-foreground">Agrega tu primer producto para comenzar.</p>
      </div>
      <Button type="button" onClick={props.onAdd}>
        Agregar primer producto
      </Button>
    </div>
  )
}
