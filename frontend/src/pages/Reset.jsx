import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await resetPassword({ token, novaSenha });
      alert(response.data.message || "Senha redefinida com sucesso!");
      navigate("/login");
    } catch (error) {
      alert(
        "Erro ao solicitar redefinição de senha: " +
          (error.response?.data?.message || error.message || error),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Redefinir Senha
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nova Senha
          </label>
          <input
            type="password"
            required
            disabled={loading}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Digite sua nova senha"
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex justify-center items-center mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600"></span>
              Carregando...
            </span>
          ) : (
            "Redefinir Senha"
          )}
        </button>
      </form>
    </div>
  );
}
