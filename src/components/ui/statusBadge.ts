import { createElement } from "react"
import { Badge } from "./Badge"

export function statusBadge(status: string) {
  const tone = ["Ativo", "Disponível"].includes(status) ? "success" : ["Inativo", "Inativa"].includes(status) ? "neutral" : "warning"
  return createElement(Badge, { tone, children: status })
}
