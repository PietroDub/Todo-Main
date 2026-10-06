import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import TodoForm from "./pages/TodoForm";
import TodoList from "./pages/TodoList";
import logoTodo from "./assets/logo-todo.png";
import Login from "./pages/Login";
import { useState, useEffect } from "react";
import { logout, getProfile } from "./api";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import ForgotPassword from "./pages/Forgot";
import ResetPassword from "./pages/Reset";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Executa toda vez que a página é recarregada (F5)
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await getProfile();
        if (response.status === 200) {
          setIsAuthenticated(true);
          setUsuarioLogado(response.data.usuario || response.data);
        }
      } catch (error) {
        console.log("Sessão não encontrada ou expirada:", error);
        setIsAuthenticated(false);
        setUsuarioLogado(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsAuthenticated(false);
      setUsuarioLogado(null);
      navigate("/");
    }
  };

  // Trava a renderização até validar o cookie no F5
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/tarefas" replace /> : <LandingPage />
        }
      />
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-gray-50 p-4">
            <header className="max-w-3xl mx-auto mb-4">
              <nav className="flex items-center py-4 justify-between border-b border-gray-200">
                <h1 className="text-2xl font-semibold">
                  <Link to={isAuthenticated ? "/tarefas" : "/"}>
                    <img
                      src={logoTodo}
                      alt="Logo ToDo"
                      className="h-16 w-auto"
                    />
                  </Link>
                </h1>

                <div className="flex items-center gap-4">
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/tarefas"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Tarefas
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Sair
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </header>

            <main className="max-w-3xl mx-auto">
              <Routes>
                <Route
                  path="tarefas"
                  element={
                    isAuthenticated ? (
                      <TodoList usuarioLogado={usuarioLogado} />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route
                  path="new"
                  element={
                    isAuthenticated ? (
                      <TodoForm />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route
                  path="login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/tarefas" replace />
                    ) : (
                      <Login
                        onLoginSuccess={() => {
                          setIsAuthenticated(true);
                          navigate("/tarefas");
                        }}
                      />
                    )
                  }
                />
                <Route
                  path="register"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/tarefas" replace />
                    ) : (
                      <Register />
                    )
                  }
                />
                <Route
                  path="forgot"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/tarefas" replace />
                    ) : (
                      <ForgotPassword />
                    )
                  }
                />
                <Route
                  path="reset-password"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/tarefas" replace />
                    ) : (
                      <ResetPassword />
                    )
                  }
                />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
