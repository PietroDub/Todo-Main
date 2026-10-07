import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { listarTarefas } from "../../api";

const situacoes = [
  { valor: "pendente", label: "Pendentes", cor: "#f59e0b" },
  { valor: "em andamento", label: "Em andamento", cor: "#3b82f6" },
  { valor: "concluida", label: "Concluídas", cor: "#22c55e" },
  { valor: "cancelada", label: "Canceladas", cor: "#6b7280" },
];

export default function TarefaSituacao() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await listarTarefas();
        setTarefas(response.data.tarefas || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Não foi possível carregar as estatísticas.",
        );
      } finally {
        setLoading(false);
      }
    };

    carregarTarefas();
  }, []);

  const quantidades = useMemo(
    () =>
      situacoes.map(
        ({ valor }) =>
          tarefas.filter((tarefa) => tarefa.situacao === valor).length,
      ),
    [tarefas],
  );

  const totalRepresentado = quantidades.reduce(
    (total, quantidade) => total + quantidade,
    0,
  );
  const labels = situacoes.map(({ label }) => label);
  const cores = situacoes.map(({ cor }) => cor);

  const donutOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    labels,
    colors: cores,
    dataLabels: {
      enabled: true,
      formatter: (porcentagem) => `${porcentagem.toFixed(0)}%`,
    },
    legend: {
      position: "bottom",
      fontSize: "13px",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => String(totalRepresentado),
            },
          },
        },
      },
    },
    stroke: { colors: ["#ffffff"], width: 3 },
    noData: { text: "Nenhuma tarefa cadastrada" },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 320 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  const barOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    colors: cores,
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "55%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (valor) => String(valor),
    },
    legend: { show: false },
    xaxis: {
      categories: labels,
      labels: {
        rotate: -20,
        trim: false,
        style: { fontSize: "12px" },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (valor) =>
          Number.isInteger(valor) ? String(valor) : "",
      },
      title: { text: "Quantidade" },
    },
    grid: { borderColor: "#e5e7eb" },
    tooltip: {
      y: {
        formatter: (valor) => `${valor} tarefa${valor === 1 ? "" : "s"}`,
      },
    },
  };

  if (loading) {
    return <p className="text-gray-500">Carregando estatísticas...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Situação das tarefas
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral das {tarefas.length} tarefas disponíveis para você.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {situacoes.map((situacao, index) => (
          <article
            key={situacao.valor}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div
              className="mb-3 h-1.5 w-10 rounded-full"
              style={{ backgroundColor: situacao.cor }}
            />
            <p className="text-xs font-medium text-gray-500">
              {situacao.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {quantidades[index]}
            </p>
          </article>
        ))}
      </div>

      {totalRepresentado === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Crie ou atualize uma tarefa para visualizar os gráficos.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-800">
              Distribuição percentual
            </h3>
            <ReactApexChart
              options={donutOptions}
              series={quantidades}
              type="donut"
              height={350}
            />
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-800">
              Comparação por quantidade
            </h3>
            <ReactApexChart
              options={barOptions}
              series={[{ name: "Tarefas", data: quantidades }]}
              type="bar"
              height={350}
            />
          </article>
        </div>
      )}
    </section>
  );
}
