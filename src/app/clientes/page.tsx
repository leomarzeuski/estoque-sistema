"use client";

import { useMemo, useState } from "react";
import { Users, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { MensagemEstado } from "@/components/MensagemEstado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClientes } from "@/hooks/useClientes";
import { useVendas } from "@/hooks/useVendas";
import { useHydrated } from "@/hooks/useHydrated";
import { criarCliente, removerCliente } from "@/services/clientes";
import { formatarMoeda, formatarNumero } from "@/lib/format";

export default function ClientesPage() {
  const clientes = useClientes();
  const vendas = useVendas();
  const hydrated = useHydrated();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const resumo = useMemo(() => {
    const mapa = new Map<
      string,
      { total: number; devendo: number; compras: number }
    >();
    for (const v of vendas) {
      if (!v.clienteId) continue;
      const r = mapa.get(v.clienteId) ?? { total: 0, devendo: 0, compras: 0 };
      r.total += v.total;
      r.compras += 1;
      if (!v.pago) r.devendo += v.total;
      mapa.set(v.clienteId, r);
    }
    return mapa;
  }, [vendas]);

  const salvar = () => {
    if (!nome.trim()) return;
    const c = criarCliente({ nome, telefone });
    setNome("");
    setTelefone("");
    setMostrarForm(false);
    toast.success(`Cliente "${c.nome}" adicionado.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <PageHeader
        titulo="Clientes"
        voltarHref="/vendas"
        acao={
          <button
            type="button"
            onClick={() => setMostrarForm((v) => !v)}
            aria-label="Novo cliente"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/20"
          >
            <UserPlus size={20} />
          </button>
        }
      />

      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {mostrarForm && (
          <div className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do cliente"
              className="h-11"
              autoFocus
            />
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Telefone (opcional)"
              className="h-11"
              inputMode="tel"
            />
            <Button onClick={salvar} className="h-11 w-full">
              Salvar cliente
            </Button>
          </div>
        )}

        {!hydrated ? (
          <p className="py-10 text-center text-gray-400">Carregando...</p>
        ) : clientes.length === 0 ? (
          <MensagemEstado
            icone={<Users className="size-12" />}
            titulo="Nenhum cliente ainda"
            descricao="Adicione clientes aqui ou na hora de registrar uma venda."
            acao={
              <Button onClick={() => setMostrarForm(true)} className="gap-2">
                <UserPlus className="size-5" /> Adicionar cliente
              </Button>
            }
          />
        ) : (
          clientes.map((c) => {
            const r = resumo.get(c.id) ?? { total: 0, devendo: 0, compras: 0 };
            return (
              <div
                key={c.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {c.nome}
                    </p>
                    {c.telefone && (
                      <p className="text-xs text-gray-500">{c.telefone}</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatarNumero(r.compras)} compra(s) · total{" "}
                      {formatarMoeda(r.total)}
                    </p>
                    {r.devendo > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Devendo {formatarMoeda(r.devendo)}
                      </span>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        aria-label="Remover cliente"
                        className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remover &quot;{c.nome}&quot;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          O cliente sai da lista. As vendas já feitas continuam no
                          histórico.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            removerCliente(c.id);
                            toast.success("Cliente removido.");
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
