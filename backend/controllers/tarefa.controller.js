import Tarefa from "../models/tarefa.js";

export default class TarefaController {
  static async criarTarefa(req, res) {
    const { titulo, descricao, dataLimite, situacao, participam } = req.body;
    const usuarioLogado = req.user.id;

    if (!titulo || !descricao || !dataLimite || !situacao) {
      return res
        .status(422)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      const tarefa = new Tarefa({
        titulo,
        descricao,
        dataLimite,
        situacao,
        criadaPor: usuarioLogado,
        participam: Array.isArray(participam)
          ? participam
          : participam
            ? [participam]
            : [],
      });

      const novaTarefa = await tarefa.save();
      const tarefaPopulada = await Tarefa.findById(novaTarefa._id)
        .populate("criadaPor", "nome email")
        .populate("participam", "nome email");

      return res.status(200).json({
        message: "Tarefa criada com sucesso.",
        novaTarefa: tarefaPopulada,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar tarefa.", error });
    }
  }

  static async listarTarefas(req, res) {
    const usuarioLogado = req.user.id;

    try {
      const tarefas = await Tarefa.find({
        $or: [{ criadaPor: usuarioLogado }, { participam: usuarioLogado }],
      })
        .populate("criadaPor", "nome")
        .populate("participam", "nome")
        .sort({ createdAt: -1 });

      return res
        .status(200)
        .json({ message: "Tarefas listadas com sucesso.", tarefas });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao listar tarefas.", error });
    }
  }
}
