import { test } from "node:test";
import assert from "node:assert/strict";

import { createTicketMailer } from "../src/services/email.service.js";

test("Envía un correo con los datos de confirmación del ticket", async () => {
  let receivedMail;

  const fakeMailer = {
    sendMail: async (mailOptions) => {
      receivedMail = mailOptions;
      return { messageId: "test-message-id" };
    }
  };

  const sendConfirmation = createTicketMailer(fakeMailer);

  const result = await sendConfirmation({
    email: "usuario@example.com",
    firstName: "Gonzalo",
    event: {
      title: "Conferencia de JavaScript",
      date: "2028-06-15T18:00:00.000Z",
      location: "Buenos Aires"
    },
    quantity: 2,
    reservationCode: "TEST-RESERVATION-123"
  });

  assert.equal(result.messageId, "test-message-id");
  assert.equal(receivedMail.to, "usuario@example.com");
  assert.equal(
    receivedMail.subject,
    "Confirmación de inscripción: Conferencia de JavaScript"
  );

  assert.ok(receivedMail.from);
  assert.match(receivedMail.text, /Hola Gonzalo/);
  assert.match(receivedMail.text, /Conferencia de JavaScript/);
  assert.match(receivedMail.text, /Buenos Aires/);
  assert.match(receivedMail.text, /Cantidad de entradas: 2/);
  assert.match(receivedMail.text, /TEST-RESERVATION-123/);
});
