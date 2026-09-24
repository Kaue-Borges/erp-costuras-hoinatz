export const fiscalService = {
  // Integração SEFAZ será implementada futuramente.
  async emitir(): Promise<never> {
    throw new Error("Integração fiscal ainda não configurada.")
  },
}
