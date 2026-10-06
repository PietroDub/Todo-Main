import { useEffect, useState } from "react";
import { listarTarefas } from "../api";
import { Link } from "react-router-dom";
import TodoItem from "../components/TodoItem";

export default function TodoList({ usuarioLogado }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    const carregarTarefas = async () => {
      setLoading(true);

      try {
        const response = await listarTarefas();
        setTarefas(response.data.tarefas);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    carregarTarefas();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm transition-all"
        >
          Nova Tarefa
        </Link>
      </div>
      {loading && <p>Carregando...</p>}
      {error && (
        <p className="text-red-600">
          {error.response?.data?.message || error.message}
        </p>
      )}
      <div className="space-y-3">
        {tarefas?.length === 0 && !loading ? (
          <p className="text-gray-500">Nenhuma Tarefa encontrada!</p>
        ) : (
          tarefas?.map((t) => (
            <TodoItem key={t._id} todo={t} usuarioLogado={usuarioLogado} />
          ))
        )}
      </div>
    </div>
  );
}
