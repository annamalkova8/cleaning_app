const nodemailer = require("nodemailer");

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMagicLink(email, link) {
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Вход в Уборка 🧹",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Привет! 👋</h2>
        <p>Нажми на кнопку ниже, чтобы войти в приложение «Уборка»:</p>
        <p style="margin: 24px 0;">
          <a href="${link}" style="background:#3b6e5e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Войти</a>
        </p>
        <p style="color:#888;font-size:13px;">Ссылка действует 15 минут. Если это были не вы — просто проигнорируйте письмо.</p>
      </div>
    `,
  });
}

async function sendInviteEmail(email, link) {
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Тебя пригласили в «Уборка» 🧹",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Тебя пригласили! 🎉</h2>
        <p>Тебя добавили в приложение для домашней уборки. Нажми, чтобы войти:</p>
        <p style="margin: 24px 0;">
          <a href="${link}" style="background:#3b6e5e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Открыть приложение</a>
        </p>
        <p style="color:#888;font-size:13px;">Ссылка действует 15 минут. Дальше можно будет входить через email в любой момент.</p>
      </div>
    `,
  });
}

module.exports = { sendMagicLink, sendInviteEmail };
