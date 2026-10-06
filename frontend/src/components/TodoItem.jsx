import { useState } from "react";
import TodoChatModal from "./TodoChatModal";

export default function TodoItem({ todo, usuarioLogado }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

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
            className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
              todo.situacao === "Concluida"
                ? "bg-green-100 text-green-700"
                : todo.situacao === "Pendente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-700"
            }`}
          >
            {todo.situacao}
          </span>
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
