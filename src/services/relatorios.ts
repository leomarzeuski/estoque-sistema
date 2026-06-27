/**
 * Geração de PDFs: relatório do estoque e recibo de venda.
 *
 * O jsPDF é carregado sob demanda (import dinâmico) só na hora de gerar o
 * PDF — assim ele não pesa no carregamento inicial das telas.
 */

import type JsPDF from "jspdf";

import type { Produto, Venda } from "@/types";
import {
  statusEstoque,
  STATUS_INFO,
  valorEmEstoque,
  calcularResumo,
} from "@/lib/estoque";
import { formatarMoeda, formatarNumero } from "@/lib/format";
import { abreviacaoUnidade } from "@/data/catalogo";

/** jsPDF + autotable expõe `lastAutoTable.finalY` para posicionar o que vem depois. */
type ComAutoTable = JsPDF & { lastAutoTable: { finalY: number } };

const VERDE: [number, number, number] = [22, 163, 74];

/** Carrega o jsPDF e o plugin de tabelas sob demanda. */
async function novoPdf() {
  const { default: JsPDFCtor } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  return { doc: new JsPDFCtor(), autoTable };
}

/** Gera e baixa o PDF com a lista completa do estoque e os totais. */
export async function baixarRelatorioEstoque(produtos: Produto[]): Promise<void> {
  const { doc, autoTable } = await novoPdf();

  doc.setFontSize(16);
  doc.text("Relatório de Estoque", 14, 18);
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 25);

  const ordenados = [...produtos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  autoTable(doc, {
    startY: 32,
    head: [["Produto", "Categoria", "Qtde", "Mínimo", "Situação", "Valor"]],
    body: ordenados.map((p) => {
      const un = abreviacaoUnidade(p.unidade);
      return [
        p.nome,
        p.categoria,
        `${formatarNumero(p.quantidade)} ${un}`,
        `${formatarNumero(p.estoqueMinimo)} ${un}`,
        STATUS_INFO[statusEstoque(p)].label,
        formatarMoeda(valorEmEstoque(p)),
      ];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: VERDE },
  });

  const resumo = calcularResumo(produtos);
  const y = (doc as ComAutoTable).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text(`Total de produtos: ${formatarNumero(resumo.totalProdutos)}`, 14, y);
  doc.text(
    `Precisam repor: ${formatarNumero(resumo.precisamAtencao)}`,
    14,
    y + 6
  );
  doc.text(
    `Valor total em estoque: ${formatarMoeda(resumo.valorTotal)}`,
    14,
    y + 12
  );

  doc.save(`relatorio-estoque-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/** Gera e baixa o recibo da venda em PDF (com cliente e descontos). */
export async function baixarReciboVenda(venda: Venda): Promise<void> {
  const { doc, autoTable } = await novoPdf();

  doc.setFontSize(16);
  doc.text("Recibo de Venda", 14, 18);
  doc.setFontSize(10);
  doc.text(new Date(venda.data).toLocaleString("pt-BR"), 14, 25);
  doc.text(`Cliente: ${venda.clienteNome}`, 14, 31);

  autoTable(doc, {
    startY: 38,
    head: [["Produto", "Qtd", "Preço un.", "Desconto", "Subtotal"]],
    body: venda.itens.map((item) => [
      item.nome,
      `${formatarNumero(item.quantidade)} ${abreviacaoUnidade(item.unidade)}`,
      formatarMoeda(item.precoUnitario),
      item.desconto > 0
        ? item.descontoTipo === "%"
          ? `${formatarNumero(item.desconto)}%`
          : formatarMoeda(item.desconto)
        : "-",
      formatarMoeda(item.subtotal),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: VERDE },
  });

  const y = (doc as ComAutoTable).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text(`Total: ${formatarMoeda(venda.total)}`, 14, y);

  doc.save(`recibo-${new Date(venda.data).toISOString().slice(0, 10)}.pdf`);
}
