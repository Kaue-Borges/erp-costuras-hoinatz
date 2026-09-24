export const efficiencyThresholds = {
  baixa: 70,
  normal: 90,
  boa: 110,
}

export function minutosEntreHorarios(inicio: string, fim: string) {
  if (!inicio || !fim) return 0
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number)
  const [horaFim, minutoFim] = fim.split(":").map(Number)
  const total = horaFim * 60 + minutoFim - (horaInicio * 60 + minutoInicio)
  return Math.max(0, total)
}

export function calcularProducaoEsperada(metaPecasHora: number, minutosTrabalhados: number) {
  return metaPecasHora > 0 ? (metaPecasHora * minutosTrabalhados) / 60 : 0
}

export function calcularEficiencia(quantidadeProduzida: number, producaoEsperada: number) {
  return producaoEsperada > 0 ? (quantidadeProduzida / producaoEsperada) * 100 : 0
}

export function classificarEficiencia(valor: number, limites = efficiencyThresholds) {
  if (valor < limites.baixa) return { label: "Abaixo da meta", tone: "danger" as const }
  if (valor < limites.normal) return { label: "Em atenção", tone: "warning" as const }
  if (valor < limites.boa) return { label: "Boa", tone: "success" as const }
  return { label: "Excelente", tone: "info" as const }
}
