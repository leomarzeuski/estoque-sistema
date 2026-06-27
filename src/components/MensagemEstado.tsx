/** Mensagem central para estados vazios, "não encontrado" ou carregando. */
export function MensagemEstado({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone?: React.ReactNode;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icone && <div className="text-gray-300">{icone}</div>}
      <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
      {descricao && (
        <p className="max-w-sm text-sm text-gray-500">{descricao}</p>
      )}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}
