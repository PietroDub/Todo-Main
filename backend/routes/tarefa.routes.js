import { Router } from "express";
import TarefaController from "../controllers/tarefa.controller.js";
import userMiddleware from "../middleware/user.js";

const tarefaRoutes = Router();

tarefaRoutes.post("/", userMiddleware, TarefaController.criarTarefa);
tarefaRoutes.get("/", userMiddleware, TarefaController.listarTarefas);

export default tarefaRoutes;
