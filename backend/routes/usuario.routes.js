import { Router } from "express";
import UsuarioController from "../controllers/usuario.controller.js";
import userMiddleware from "../middleware/user.js";

const usuarioRoutes = Router();

usuarioRoutes.post("/", UsuarioController.registrarUsuario);
usuarioRoutes.post("/login", UsuarioController.login);
usuarioRoutes.post("/logout", UsuarioController.logout);
usuarioRoutes.post("/resetPassword", UsuarioController.resetPassword);
usuarioRoutes.post("/forgotPassword", UsuarioController.forgotPassword);
usuarioRoutes.get("/me", userMiddleware, UsuarioController.profile);
usuarioRoutes.get(
  "/getUsersExceptLogged",
  userMiddleware,
  UsuarioController.getAllExceptLogged,
);

export default usuarioRoutes;
