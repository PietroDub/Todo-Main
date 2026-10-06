import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Configuração do transportador de e-mail (Gmail/SMTP)
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // Retorna 'false' para a porta 587 (usa STARTTLS)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (toEmail, token) => {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"To-Do List Node.js e MongoDB" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Redefinição de Senha Solicitada",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>Solicitação de Redefinição de Senha</h2>
        <p>Você solicitou a redefinição da sua senha no sistema <strong>To-Do List Node.js e MongoDB</strong>.</p>
        <p>Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a>
        </p>
        <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
      </div>
    `,
  });
};
