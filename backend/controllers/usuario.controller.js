import Usuario from "../models/usuario.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../services/email.service.js";
import crypto from "crypto";

export default class UsuarioController {
  static async registrarUsuario(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(422)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      const hashPassword = await argon2.hash(senha);

      const usuario = new Usuario({
        nome,
        email,
        senha: hashPassword,
      });

      const novoUsuario = await usuario.save();

      return res
        .status(200)
        .json({ message: "Usuário cadastrado com sucesso.", novoUsuario });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao cadastrar usuário.", error });
    }
  }

  static async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(422)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      const usuario = await Usuario.findOne({ email }).select("+senha");

      if (!usuario)
        return res.status(400).json({ message: "Credenciais inválidas." });

      const senhaValida = await argon2.verify(usuario.senha, senha);

      if (!senhaValida)
        return res.status(400).json({ message: "Credenciais inválidas." });

      const tokenPayload = {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true, // Evita acesso por scrits JavaScript
        secure: false, // Tornar true em produção, exige https
        sameSite: "lax", // Comunicação entre front e back
        maxAge: process.env.JWT_EXPIRATION_MS || 3600000, // 1h
      });

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
        },
        token,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao realizar o login.", error });
    }
  }

  static async logout(req, res) {
    try {
      // Limpa o cookie chamado 'jwt'
      res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Altere para true se estiver em produção (HTTPS)
        sameSite: "lax",
      });

      return res.status(200).json({ message: "Logout realizado com sucesso." });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao realizar logout.", error });
    }
  }

  static async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) return res.status(402).json({ message: "E-mail requerido." });

    try {
      const usuario = await Usuario.findOne({ email });

      if (!usuario) {
        return res.status(200).json({
          message: "Se o e-mail estiver cadastrado, um link será enviado.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashToken = await argon2.hash(resetToken);
      const resetTokenExpire = new Date(
        Date.now() +
          (process.env.RESET_TOKEN_EXPIRATION_HOURS || 1) * 60 * 60 * 1000,
      );

      await Usuario.findByIdAndUpdate(usuario.id, {
        resetToken: hashToken,
        resetTokenExpire: resetTokenExpire,
      });

      await sendPasswordResetEmail(usuario.email, resetToken).catch((err) => {
        console.error("Falha no envio do e-mail.", err);
      });

      return res.status(200).json({
        message: "Se o e-mail estiver cadastrado, um link será enviado.",
      });
    } catch (error) {
      return res.status(200).json({
        message: "Se o e-mail estiver cadastrado, um link será enviado.",
      });
    }
  }

  static async resetPassword(req, res) {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res
        .status(400)
        .json({ message: "Token e nova senha são obrigatórios." });
    }

    try {
      // Busca usuários que possuem um token válido e não expirado
      // Observação: select('+resetToken +resetTokenExpire') força a busca desses campos caso estejam ocultos no Schema
      const usuarios = await Usuario.find({
        resetTokenExpire: { $gt: Date.now() }, // $gt = Greater Than (Data de expiração maior que 'agora')
      }).select("+resetToken +resetTokenExpire");

      let usuarioValido = null;

      // Compara o token recebido com os hashes salvos no banco
      for (const usuario of usuarios) {
        if (usuario.resetToken) {
          const tokenValido = await argon2.verify(usuario.resetToken, token);
          if (tokenValido) {
            usuarioValido = usuario;
            break;
          }
        }
      }

      // Se nenhum usuário for encontrado com esse token válido
      if (!usuarioValido)
        return res.status(400).json({ message: "Token inválido ou expirado." });

      // Hash da nova senha
      const hashNovaSenha = await argon2.hash(novaSenha);

      // Atualiza a senha e limpa o token de recuperação
      usuarioValido.senha = hashNovaSenha;
      usuarioValido.resetToken = undefined;
      usuarioValido.resetTokenExpire = undefined;

      await usuarioValido.save();

      return res.status(200).json({ message: "Senha redefinida com sucesso!" });
    } catch (error) {
      console.error("Erro ao redefinir a senha: ", error);
      return res
        .status(500)
        .json({ message: "Erro ao redefinir a senha.", error });
    }
  }

  static async profile(req, res) {
    try {
      const userToken = req.user;

      if (!userToken)
        return res.status(401).json({ message: "Não autenticado." });

      // Extrai o ID do usuário guardado dentro do req.user (pode ser id ou _id dependendo de como salvou no JWT)
      const userId = userToken.id || userToken._id;

      // BUSCA NO BANCO DE DADOS

      // O Mongoose já esconde a senha automaticamente por conta do "select: false" no Schema
      const dadosUsuario = await Usuario.findById(userId);

      if (!dadosUsuario)
        return res.status(404).json({ message: "Usuário não encontrado." });

      // Retorna os dados do banco para o Frontend
      return res.status(200).json({ usuario: dadosUsuario });
    } catch (error) {
      console.error("Erro no Profile: ", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar usuário.", error: error.message });
    }
  }

  static async getAllExceptLogged(req, res) {
    try {
      const usuarioLogado = req.user.id;
      const usuarios = await Usuario.find({
        _id: { $ne: usuarioLogado },
      })
        .select("nome email")
        .sort({ nome: -1 });

      return res.status(200).json({ usuarios });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Problema ao buscar usuários.", error });
    }
  }
}
