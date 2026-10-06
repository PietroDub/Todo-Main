import "dotenv/config"; // Tem que ser a primeira linha no index
import { Server } from "socket.io";
import { createServer } from "http"; // Juntar o express com websocket
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import tarefaRoutes from "./routes/tarefa.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import cookieParser from "cookie-parser";
import registerChatSocket from "./socket/registerChatSocket.js";
import chatRoutes from "./routes/chat.routes.js";

// Suporte para importar arquivos JSON usando ESModules
const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger-output.json");

const app = express();

const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
};

// Comunicação entre o front-end e o back-end usar JSON
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Criar um servidor HTTP
const httpServer = createServer(app);

// Iniciar o websocket
const io = new Server(httpServer, { cors: corsOptions });

io.on("connect", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);
  registerChatSocket(io, socket);
  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});

// Obrigatório que o Swagger deva vir antes das rotas
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/tarefas", tarefaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

// Use o servidor HTTP integrado ao Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
