/**
 * Dados de exemplo para o primeiro contato com o sistema.
 * Servem só para a pessoa ver como funciona — podem ser apagados depois.
 */

import { criarProduto, type ProdutoInput } from "@/services/produtos";

const EXEMPLOS: ProdutoInput[] = [
  {
    nome: "Tomate",
    categoria: "Legume",
    unidade: "caixa",
    precoCusto: 45,
    precoVenda: 70,
    quantidade: 25,
    estoqueMinimo: 8,
    fornecedor: "Box 142",
  },
  {
    nome: "Banana Prata",
    categoria: "Fruta",
    unidade: "caixa",
    precoCusto: 60,
    precoVenda: 90,
    quantidade: 12,
    estoqueMinimo: 5,
    fornecedor: "Box 88",
  },
  {
    nome: "Batata",
    categoria: "Legume",
    unidade: "saco",
    precoCusto: 80,
    precoVenda: 115,
    quantidade: 6,
    estoqueMinimo: 6,
    fornecedor: "Box 31",
  },
  {
    nome: "Cebola",
    categoria: "Legume",
    unidade: "saco",
    precoCusto: 70,
    precoVenda: 100,
    quantidade: 3,
    estoqueMinimo: 5,
  },
  {
    nome: "Alface Crespa",
    categoria: "Verdura",
    unidade: "duzia",
    precoCusto: 18,
    precoVenda: 30,
    quantidade: 0,
    estoqueMinimo: 4,
  },
  {
    nome: "Maçã Gala",
    categoria: "Fruta",
    unidade: "caixa",
    precoCusto: 120,
    precoVenda: 170,
    quantidade: 18,
    estoqueMinimo: 6,
    fornecedor: "Box 207",
  },
];

/** Cadastra os produtos de exemplo. */
export function popularExemplos(): void {
  EXEMPLOS.forEach(criarProduto);
}
