const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  XOF: "CFA",
  CAD: "CA$",
  CHF: "CHF",
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

export function formatMoney(amount: number, currency = "EUR"): string {
  const symbol = getCurrencySymbol(currency)
  const value = Number(amount || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  if (currency === "XOF") return `${value} ${symbol}`
  return `${value} ${symbol}`
}

export function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "")
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(",")
    )
    .join("\n")
}
