import { useState } from "react";
import TodoChatModal from "./TodoChatModal";
import { atualizarSituacaoTarefa } from "../api";

const situacoes = {
  pendente: {
    label: "Pendente",
    classes: "bg-yellow-100 text-yellow-800",
  },
  "em andamento": {
    label: "Em andamento",
    classes: "bg-blue-100 text-blue-700",
  },
  concluida: {
    label: "Concluída",
    classes: "bg-green-100 text-green-700",
  },
  cancelada: {
    label: "Cancelada",
    classes: "bg-gray-100 text-gray-700",
  },
};

export default function TodoItem({
  todo,
  usuarioLogado,
  onTarefaAtualizada,
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [atualizandoSituacao, setAtualizandoSituacao] = useState(false);
  const [erroSituacao, setErroSituacao] = useState("");

  // Extrai as iniciais do nome (ex: "Carlos Silva" -> "CS")
  const getInitials = (nome) => {
    if (!nome) return "?";
    const parts = nome.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const criador = todo.criadaPor;
  const participantes = todo.participam || [];

  // Limite de participantes visíveis na pilha
  const maxVisible = 3;
  const visibleParticipantes = participantes.slice(0, maxVisible);
  const extraCount = participantes.length - maxVisible;

  // Lista com todos os nomes para tooltip
  const todosNomesParticipantes = participantes.map((p) => p.nome).join(", ");
  const situacaoAtual = situacoes[todo.situacao] || {
    label: todo.situacao,
    classes: "bg-gray-100 text-gray-700",
  };

  const handleSituacaoChange = async (event) => {
    const novaSituacao = event.target.value;

    if (novaSituacao === todo.situacao) return;

    try {
      setAtualizandoSituacao(true);
      setErroSituacao("");

      const response = await atualizarSituacaoTarefa(todo._id, novaSituacao);
      onTarefaAtualizada(response.data.tarefa);
    } catch (error) {
      setErroSituacao(
        error.response?.data?.message || "Não foi possível atualizar a situação.",
      );
    } finally {
      setAtualizandoSituacao(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
        {/* Linha Superior: Título + Badge de Situação */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg leading-tight">
              {todo.titulo}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{todo.descricao}</p>
          </div>

          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${situacaoAtual.classes}`}
          >
            {situacaoAtual.label}
          </span>

          <div className="flex flex-col items-end gap-1">
            <select
              aria-label={`Alterar situação da tarefa ${todo.titulo}`}
              value={todo.situacao}
              onChange={handleSituacaoChange}
              disabled={atualizandoSituacao}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 disabled:cursor-wait disabled:opacity-60"
            >
              <option value="pendente">Pendente</option>
              <option value="em andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
            {erroSituacao && (
              <span className="max-w-48 text-right text-xs text-red-600">
                {erroSituacao}
              </span>
            )}
          </div>
        </div>

        {/* Rodapé do Card: Infos + Equipe + Botão de Chat */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-medium text-gray-700">Prazo:</span>{" "}
              {todo.dataLimite
                ? new Date(todo.dataLimite).toLocaleDateString("pt-BR")
                : "Sem data"}
            </div>
            {criador && (
              <div>
                <span className="font-medium text-gray-700">Criada por:</span>{" "}
                <span className="text-gray-900 font-medium">
                  {criador.nome}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Participantes da tarefa */}
            {participantes.length > 0 && (
              <div
                className="flex items-center gap-2"
                title={`Participantes: ${todosNomesParticipantes}`}
              >
                <span className="font-medium text-gray-700 hidden sm:inline">
                  Equipe:
                </span>

                <div className="flex -space-x-2 overflow-hidden">
                  {visibleParticipantes.map((participante, index) => (
                    <div
                      key={participante._id || index}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white font-semibold border-2 border-white shadow-xs text-[10px]"
                      title={participante.nome}
                    >
                      {getInitials(participante.nome)}
                    </div>
                  ))}

                  {extraCount > 0 && (
                    <div
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold border-2 border-white shadow-xs text-[10px]"
                      title={`Mais ${extraCount} participantes: ${participantes
                        .slice(maxVisible)
                        .map((p) => p.nome)
                        .join(", ")}`}
                    >
                      +{extraCount}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/*Botão para abrir o modal de Chat */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer ml-auto"
              title="Abrir chat da tarefa"
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal do Chat acionado pelo estado */}
      {isChatOpen && (
        <TodoChatModal
          tarefa={todo}
          usuarioLogado={usuarioLogado}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
