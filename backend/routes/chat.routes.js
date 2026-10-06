import { Router } from "express";
import ChatController from "../controllers/chat.controller.js";
import userMiddleware from "../middleware/user.js";

const chatRoutes = Router();

chatRoutes.get(
  "/getHistory/:tarefaId",
  userMiddleware,
  ChatController.getHistory,
);

export default chatRoutes;
