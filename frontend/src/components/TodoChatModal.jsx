import { io } from "socket.io-client";
import { getChatHistory } from "../api";
import { useState, useRef, useEffect } from "react";

const SOCKET_URL = import.meta.env.VITE_BASE_URL;

export default function TodoChatModal({ tarefa, usuarioLogado, onClose }) {
  const [mensagens, setMensagens] = useState([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const mensagensEndRef = useRef(null);

  // Autoscroll para as mensagens
  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carregar histórico
  useEffect(() => {
    async function carregarHistorico() {
      try {
        setLoading(true);
        const res = await getChatHistory(tarefa._id);
        setMensagens(res.data.mensagens || []);
      } catch (error) {
        console.error("Erro ao buscar histórico de mensagens:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarHistorico();

    // Inicializar o socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.emit("join_chat", tarefa._id); // Entrar no chat
    // Ouvir as mensagens em tempo real
    socketRef.current.on("receive_message", (mensagemRecebida) => {
      setMensagens((prev) => [...prev, mensagemRecebida]);
    });

    // Limpar e fechar o modal
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_chat", tarefa._id);
        socketRef.current.disconnect();
      }
    };
  }, [tarefa._id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;

    // Emitir mensagem preenchida
    socketRef.current.emit("send_message", {
      tarefaId: tarefa._id,
      remetenteId: usuarioLogado._id || usuarioLogado.id,
      texto: novoTexto,
    });

    setNovoTexto("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg flex flex-col h-137.5 overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{tarefa.titulo}</h3>
            <p className="text-xs text-gray-500">
              Chat em tempo real da tarefa
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 py-1 px-2.5 rounded-lg hover:bg-gray-200 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
          {loading ? (
            <p className="text-center text-sm text-gray-500 my-auto py-8">
              Carregando histórico...
            </p>
          ) : mensagens.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          ) : (
            mensagens.map((msg, index) => {
              const eMeu =
                (msg.remetente?._id || msg.remetente) ===
                (usuarioLogado._id || usuarioLogado.id);

              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${
                    eMeu ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[10px] text-gray-400 mb-0.5 px-1">
                    {msg.remetente?.nome || "Usuário"}
                  </span>
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                      eMeu
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-2xs"
                    }`}
                  >
                    {msg.texto}
                  </div>
                </div>
              );
            })
          )}
          <div ref={mensagensEndRef} />
        </div>

        {/* Input de Envio */}
        <form
          onSubmit={handleEnviar}
          className="p-3 border-t border-gray-200 bg-white flex gap-2"
        >
          <input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
