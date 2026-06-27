"use client";

import { useRef } from "react";
import { Download, Upload, Sparkles, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { baixarBackup, restaurarBackup } from "@/services/backup";
import { baixarRelatorioEstoque } from "@/services/relatorios";
import { popularExemplos } from "@/data/exemplos";
import { useProdutos } from "@/hooks/useProdutos";
import { useFonteGrande } from "@/hooks/useFonteGrande";
import { limparTudo } from "@/lib/db";

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">{titulo}</h2>
      <p className="mt-1 text-sm text-gray-500">{descricao}</p>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

export default function ConfiguracoesPage() {
  const inputArquivo = useRef<HTMLInputElement>(null);
  const produtos = useProdutos();
  const [fonteGrande, setFonteGrande] = useFonteGrande();

  const aoEscolherArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = restaurarBackup(String(leitor.result));
      if (resultado.ok) {
        toast.success(
          `Backup restaurado: ${resultado.produtos} produto(s).`
        );
      } else {
        toast.error(resultado.erro);
      }
    };
    leitor.onerror = () => toast.error("Não foi possível ler o arquivo.");
    leitor.readAsText(arquivo);
  };

  const carregarExemplos = () => {
    popularExemplos();
    toast.success("Produtos de exemplo adicionados.");
  };

  const apagarTudo = () => {
    limparTudo();
    toast.success("Todos os dados foram apagados.");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <PageHeader titulo="Ajustes" voltarHref="/" />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Relatório */}
        <Secao
          titulo="Relatório do estoque"
          descricao="Gera um PDF com todos os produtos, situação e valores — bom para imprimir ou guardar."
        >
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base"
            onClick={async () => {
              if (produtos.length === 0) {
                toast.error("Cadastre produtos antes de gerar o relatório.");
                return;
              }
              await baixarRelatorioEstoque(produtos);
            }}
          >
            <FileText className="size-5 text-blue-700" />
            Baixar relatório (PDF)
          </Button>
        </Secao>

        {/* Acessibilidade */}
        <Secao
          titulo="Acessibilidade"
          descricao="Deixe as letras maiores para enxergar melhor."
        >
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-900">Fonte grande</span>
            <Switch
              checked={fonteGrande}
              onCheckedChange={setFonteGrande}
              aria-label="Fonte grande"
            />
          </div>
        </Secao>

        {/* Backup */}
        <Secao
          titulo="Backup e segurança"
          descricao="Os dados ficam neste aparelho. Faça um backup de vez em quando para não perder nada."
        >
          <input
            ref={inputArquivo}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={aoEscolherArquivo}
          />

          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base"
            onClick={baixarBackup}
          >
            <Download className="size-5 text-green-700" />
            Baixar backup
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-full justify-start gap-3 text-base"
              >
                <Upload className="size-5 text-blue-700" />
                Restaurar backup
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar um backup?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os dados que estão neste aparelho agora serão substituídos
                  pelos dados do arquivo de backup.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => inputArquivo.current?.click()}
                >
                  Escolher arquivo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Secao>

        {/* Exemplos */}
        <Secao
          titulo="Produtos de exemplo"
          descricao="Adiciona alguns produtos prontos para você ver como o sistema funciona."
        >
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base"
            onClick={carregarExemplos}
          >
            <Sparkles className="size-5 text-amber-600" />
            Carregar produtos de exemplo
          </Button>
        </Secao>

        {/* Apagar tudo */}
        <Secao
          titulo="Apagar tudo"
          descricao="Remove todos os produtos e o histórico deste aparelho. Faça um backup antes!"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-12 w-full justify-start gap-3 border-red-200 text-base text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="size-5" />
                Apagar todos os dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os produtos e o histórico serão removidos deste
                  aparelho. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={apagarTudo}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Apagar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Secao>
      </div>
    </div>
  );
}
