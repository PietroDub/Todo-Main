import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true, // Permite o envio de cookies e sessões
  headers: {
    "Content-Type": "application/json",
  },
});

// Tarefas
export const listarTarefas = () => api.get("/tarefas");
export const criarTarefa = (task) => api.post("/tarefas", task);

// Usuários
export const registrarUsuario = (usuario) => api.post("/usuarios", usuario);
export const login = (payload) => api.post("/usuarios/login", payload);
export const logout = () => api.post("/usuarios/logout");
export const resetPassword = (payload) =>
  api.post("/usuarios/resetPassword", payload);
export const forgotPassword = (payload) =>
  api.post("/usuarios/forgotPassword", payload);
export const getProfile = () => api.get("/usuarios/me");
export const getUsersExceptLogged = () =>
  api.get("/usuarios/getUsersExceptLogged");

// Chat
export const getChatHistory = (tarefaId) =>
  api.get(`/chat/getHistory/${tarefaId}`);

export default api;
