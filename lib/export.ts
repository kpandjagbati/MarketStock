"use client"

import { Product, Transaction } from "@/type"
import { downloadBlob, formatMoney, toCsv } from "@/lib/format"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function stamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function exportProductsCsv(products: Product[], currency = "EUR") {
  const rows: (string | number)[][] = [
    ["Nom", "Description", "Catégorie", "Prix", "Quantité", "Unité", "Seuil", "Valeur stock"],
    ...products.map((p) => [
      p.name,
      p.description,
      p.categoryName,
      p.price,
      p.quantity,
      p.unit,
      p.minQuantity,
      Number((p.price * p.quantity).toFixed(2)),
    ]),
  ]
  downloadBlob(
    "\uFEFF" + toCsv(rows),
    `inventaire-${stamp()}.csv`,
    "text/csv;charset=utf-8"
  )
}

export function exportTransactionsCsv(transactions: Transaction[]) {
  const rows: (string | number)[][] = [
    ["Date", "Type", "Produit", "Catégorie", "Quantité", "Unité", "Bénéficiaire", "Motif", "Prix unitaire"],
    ...transactions.map((tx) => [
      new Date(tx.createdAt).toLocaleString("fr-FR"),
      tx.type === "IN" ? "Entrée" : "Sortie",
      tx.productName,
      tx.categoryName,
      tx.quantity,
      tx.unit,
      tx.beneficiary || "",
      tx.reason || "",
      tx.price,
    ]),
  ]
  downloadBlob(
    "\uFEFF" + toCsv(rows),
    `transactions-${stamp()}.csv`,
    "text/csv;charset=utf-8"
  )
}

export function exportProductsPdf(
  products: Product[],
  options?: { title?: string; currency?: string }
) {
  const currency = options?.currency || "EUR"
  const doc = new jsPDF()
  const title = options?.title || "Inventaire stock"

  doc.setFontSize(16)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 26)

  autoTable(doc, {
    startY: 32,
    head: [["Nom", "Catégorie", "Prix", "Qté", "Seuil", "Valeur"]],
    body: products.map((p) => [
      p.name,
      p.categoryName,
      formatMoney(p.price, currency),
      `${p.quantity} ${p.unit}`,
      String(p.minQuantity),
      formatMoney(p.price * p.quantity, currency),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
  })

  doc.save(`inventaire-${stamp()}.pdf`)
}

export function exportTransactionsPdf(
  transactions: Transaction[],
  options?: { title?: string }
) {
  const doc = new jsPDF({ orientation: "landscape" })
  const title = options?.title || "Historique des transactions"

  doc.setFontSize(16)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 26)

  autoTable(doc, {
    startY: 32,
    head: [["Date", "Type", "Produit", "Qté", "Bénéficiaire", "Motif"]],
    body: transactions.map((tx) => [
      new Date(tx.createdAt).toLocaleDateString("fr-FR"),
      tx.type === "IN" ? "Entrée" : "Sortie",
      tx.productName,
      `${tx.quantity} ${tx.unit}`,
      tx.beneficiary || "—",
      tx.reason || "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
  })

  doc.save(`transactions-${stamp()}.pdf`)
}
