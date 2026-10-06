import ChatController from "../controllers/chat.controller.js";

export default function registerChatSocket(io, socket) {
  // Entrar em uma sala específica de uma tarefa
  socket.on("join_chat", (tarefaId) => {
    socket.join(`tarefa_${tarefaId}`);
    console.log(`Socket ${socket.id} entrou no chat da tarefa_${tarefaId}.`);
  });

  // Enviar a mensagem
  socket.on("send_message", (data) => {
    ChatController.sendSaveMessage(io, socket, data);
  });

  // Sair do chat
  socket.on("leave_chat", (tarefaId) => {
    socket.leave(`tarefa_${tarefaId}`);
    console.log(`Socket ${socket.id} saiu do chat da tarefa_${tarefaId}.`);
  });
}
