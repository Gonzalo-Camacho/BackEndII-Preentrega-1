import nodemailer from "nodemailer";

import {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM
} from "../config/env.config.js";

let transporter;

const getTransporter = () => {
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS || !MAIL_FROM) {
    throw new Error(
      "La configuración del servicio de correo está incompleta"
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: MAIL_PORT === 465,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS
      }
    });
  }

  return transporter;
};

export const createTicketMailer = (mailer) => {
  return async ({
    email,
    firstName,
    event,
    quantity,
    reservationCode
  }) => {
    return mailer.sendMail({
      from: MAIL_FROM || "Plataforma de Eventos <test@example.com>",
      to: email,
      subject: `Confirmación de inscripción: ${event.title}`,
      text: `
Hola ${firstName},

Tu inscripción al evento fue confirmada.

Evento: ${event.title}
Fecha: ${new Date(event.date).toLocaleString("es-AR")}
Ubicación: ${event.location}
Cantidad de entradas: ${quantity}
Código de reserva: ${reservationCode}

¡Gracias por inscribirte!
      `.trim()
    });
  };
};

export const sendTicketConfirmation = async (data) => {
  const sendMail = createTicketMailer(getTransporter());
  return sendMail(data);
};