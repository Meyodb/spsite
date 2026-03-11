import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO,
  CONTACT_FROM,
} = process.env;

let transporter = null;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true", // true pour 465, false pour STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendContactEmail({ id, sujet, nom, prenom, email, telephone, entreprise, fonction, message, created_at }) {
  if (!transporter) {
    console.warn("[mail] Transporter SMTP non configuré, email non envoyé.");
    return;
  }

  const to = CONTACT_TO || "contact@soup-juice.com";
  const from = CONTACT_FROM || SMTP_USER;

  const subject = `[Soup & Juice] Nouveau message de contact (#${id}) - ${sujet || "sans sujet"}`;

  const text = `
Nouveau message de contact :

ID        : ${id}
Date      : ${created_at}

Nom       : ${nom}
Prénom    : ${prenom}
Email     : ${email}
Téléphone : ${telephone}
Entreprise: ${entreprise || "-"}
Fonction  : ${fonction || "-"}
Sujet     : ${sujet}

Message :
${message}
`.trim();

  const html = `
    <h2>Nouveau message de contact</h2>
    <ul>
      <li><strong>ID</strong> : ${id}</li>
      <li><strong>Date</strong> : ${created_at}</li>
      <li><strong>Nom</strong> : ${nom}</li>
      <li><strong>Prénom</strong> : ${prenom}</li>
      <li><strong>Email</strong> : ${email}</li>
      <li><strong>Téléphone</strong> : ${telephone}</li>
      <li><strong>Entreprise</strong> : ${entreprise || "-"}</li>
      <li><strong>Fonction</strong> : ${fonction || "-"}</li>
      <li><strong>Sujet</strong> : ${sujet}</li>
    </ul>
    <h3>Message</h3>
    <p>${(message || "").replace(/\n/g, "<br />")}</p>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

