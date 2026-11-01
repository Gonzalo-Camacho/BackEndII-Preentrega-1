
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Event from "../src/models/Event.js";
import Ticket from "../src/models/Ticket.js";
import { MONGO_URL } from "../src/config/env.config.js";
import { generateToken } from "../src/utils/jwt.js";
import { createEventTicket } from "../src/services/ticket.service.js";

const testEmails = [
  "autotest-user-tickets@example.com",
  "autotest-other-user-tickets@example.com",
  "autotest-organizer-tickets@example.com",
  "autotest-other-organizer-tickets@example.com",
  "autotest-admin-tickets@example.com"
];

let user;
let otherUser;
let organizer;
let otherOrganizer;
let admin;

let userToken;
let otherUserToken;
let organizerToken;
let otherOrganizerToken;
let adminToken;

let mainEvent;
let otherEvent;
let cancelledEvent;
let finishedEvent;
let pastEvent;
let draftEvent;

let userTicket;
let otherUserTicket;

const authCookie = (token) => `currentUser=${token}`;

const testEventData = {
  title: "Evento de prueba de tickets",
  description: "Evento para pruebas automatizadas de inscripciones",
  category: "Tecnología",
  date: "2028-06-15T18:00:00.000Z",
  location: "Buenos Aires",
  capacity: 5,
  price: 1000
};

before(async () => {
  await mongoose.connect(MONGO_URL);

  assert.equal(
    mongoose.connection.name,
    "backendii_test",
    "ERROR: las pruebas deben ejecutarse exclusivamente sobre backendii_test"
  );

  await User.deleteMany({
    email: { $in: testEmails }
  });

  user = await User.create({
    first_name: "Usuario",
    last_name: "Prueba",
    email: testEmails[0],
    password: "PasswordTest123",
    role: "user"
  });

  otherUser = await User.create({
    first_name: "Otro",
    last_name: "Usuario",
    email: testEmails[1],
    password: "PasswordTest123",
    role: "user"
  });

  organizer = await User.create({
    first_name: "Organizador",
    last_name: "Prueba",
    email: testEmails[2],
    password: "PasswordTest123",
    role: "organizer"
  });

  otherOrganizer = await User.create({
    first_name: "Otro",
    last_name: "Organizador",
    email: testEmails[3],
    password: "PasswordTest123",
    role: "organizer"
  });

  admin = await User.create({
    first_name: "Administrador",
    last_name: "Prueba",
    email: testEmails[4],
    password: "PasswordTest123",
    role: "admin"
  });

  userToken = generateToken(user);
  otherUserToken = generateToken(otherUser);
  organizerToken = generateToken(organizer);
  otherOrganizerToken = generateToken(otherOrganizer);
  adminToken = generateToken(admin);

  mainEvent = await Event.create({
    ...testEventData,
    organizer: organizer._id,
    status: "published"
  });

  otherEvent = await Event.create({
    ...testEventData,
    title: "Evento de otro organizador",
    organizer: otherOrganizer._id,
    status: "published"
  });

  cancelledEvent = await Event.create({
    ...testEventData,
    title: "Evento cancelado",
    organizer: organizer._id,
    status: "cancelled"
  });

  draftEvent = await Event.create({
    ...testEventData,
    title: "Evento en borrador",
    organizer: organizer._id,
    status: "draft"
  });

  finishedEvent = await Event.create({
    ...testEventData,
    title: "Evento finalizado",
    organizer: organizer._id,
    status: "finished"
  });

  pastEvent = await Event.create({
    ...testEventData,
    title: "Evento con fecha pasada",
    date: "2020-01-01T18:00:00.000Z",
    organizer: organizer._id,
    status: "published"
  });
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name === "backendii_test") {
      await Ticket.deleteMany({
        user: {
          $in: [
            user?._id,
            otherUser?._id,
            organizer?._id,
            otherOrganizer?._id,
            admin?._id
          ]
        }
      });

      await Event.deleteMany({
        organizer: {
          $in: [
            user?._id,
            otherUser?._id,
            organizer?._id,
            otherOrganizer?._id,
            admin?._id
          ]
        }
      });

      await User.deleteMany({
        email: { $in: testEmails }
      });
    }

    await mongoose.disconnect();
  }
});

test("Inscripción a eventos", async (t) => {
  await t.test("No permite inscribirse sin autenticación", async () => {
    const response = await request(app)
      .post(`/api/events/${mainEvent._id}/tickets`)
      .send({ quantity: 1 });

    assert.equal(response.status, 401);
  });

  await t.test("No permite inscribirse a un evento inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post(`/api/events/${fakeId}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 404);
  });

  await t.test("No permite inscribirse a un evento cancelado", async () => {
    const response = await request(app)
      .post(`/api/events/${cancelledEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 400);
  });

  await t.test("No permite inscribirse a un evento en borrador", async () => {
    const response = await request(app)
      .post(`/api/events/${draftEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
     .send({ quantity: 1 });

    assert.equal(response.status, 400);
  });

  await t.test("No permite inscribirse a un evento finalizado", async () => {
    const response = await request(app)
      .post(`/api/events/${finishedEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 400);
  });

  await t.test("No permite inscribirse a un evento con fecha pasada", async () => {
    const response = await request(app)
      .post(`/api/events/${pastEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 400);
  });

  await t.test("No permite cantidades inválidas", async () => {
    for (const quantity of [0, -1, 1.5, "dos"]) {
      const response = await request(app)
        .post(`/api/events/${mainEvent._id}/tickets`)
        .set("Cookie", authCookie(userToken))
        .send({ quantity });

      assert.equal(response.status, 400);
    }
  });

  await t.test("Un usuario puede inscribirse correctamente", async () => {
    const response = await request(app)
      .post(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 2 });

    assert.equal(response.status, 201);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.payload.status, "confirmed");
    assert.equal(response.body.payload.quantity, 2);

    userTicket = response.body.payload;

    const updatedEvent = await Event.findById(mainEvent._id);

    assert.equal(updatedEvent.reservedSeats, 2);
  });

  await t.test("No permite una segunda inscripción activa del mismo usuario", async () => {
    const response = await request(app)
      .post(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 409);
  });

  await t.test("Otro usuario puede inscribirse al mismo evento", async () => {
    const response = await request(app)
      .post(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(otherUserToken))
      .send({ quantity: 3 });

    assert.equal(response.status, 201);
    assert.equal(response.body.payload.quantity, 3);

    otherUserTicket = response.body.payload;

    const updatedEvent = await Event.findById(mainEvent._id);

    assert.equal(updatedEvent.reservedSeats, 5);
  });

  await t.test("No permite superar la capacidad del evento", async () => {
    const response = await request(app)
      .post(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(adminToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 409);

    const updatedEvent = await Event.findById(mainEvent._id);

    assert.equal(updatedEvent.reservedSeats, 5);
  });
});

test("Consulta de tickets", async (t) => {
  await t.test("Un usuario puede consultar sus propios tickets", async () => {
    const response = await request(app)
      .get("/api/tickets/my-tickets")
      .set("Cookie", authCookie(userToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");
    assert.ok(Array.isArray(response.body.payload));

    assert.ok(
      response.body.payload.every(
        (ticket) => ticket.user.toString() === user._id.toString()
      )
    );

    assert.ok(
      response.body.payload.every(
        (ticket) => ticket.event.title
      )
    );
  });

  await t.test("No permite consultar tickets propios sin autenticación", async () => {
    const response = await request(app)
      .get("/api/tickets/my-tickets");

    assert.equal(response.status, 401);
  });

  await t.test("Un usuario común no puede consultar tickets de un evento", async () => {
    const response = await request(app)
      .get(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken));

    assert.equal(response.status, 403);
  });

  await t.test("Un organizador puede consultar tickets de su propio evento", async () => {
    const response = await request(app)
      .get(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(organizerToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");
    assert.ok(Array.isArray(response.body.payload));
    assert.equal(response.body.payload.length, 2);
  });

  await t.test("Un organizador no puede consultar tickets de un evento ajeno", async () => {
    const response = await request(app)
      .get(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(otherOrganizerToken));

    assert.equal(response.status, 403);
  });

  await t.test("Un administrador puede consultar tickets de cualquier evento", async () => {
    const response = await request(app)
      .get(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(adminToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.payload.length, 2);
  });
});

test("Cancelación de tickets", async (t) => {

  await t.test("No permite cancelar un ticket sin autenticación", async () => {
    const response = await request(app)
      .patch(`/api/tickets/${userTicket._id}/cancel`);

    assert.equal(response.status, 401);
  });

  await t.test("No permite cancelar un ticket inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/tickets/${fakeId}/cancel`)
      .set("Cookie", authCookie(userToken));

    assert.equal(response.status, 404);
  });

  await t.test("Un usuario no puede cancelar el ticket de otra persona", async () => {
    const response = await request(app)
      .patch(`/api/tickets/${userTicket._id}/cancel`)
      .set("Cookie", authCookie(otherUserToken));

    assert.equal(response.status, 403);
  });

  await t.test("El dueño puede cancelar su propio ticket", async () => {
    const response = await request(app)
      .patch(`/api/tickets/${userTicket._id}/cancel`)
      .set("Cookie", authCookie(userToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.payload.status, "cancelled");
    assert.ok(response.body.payload.cancelledAt);

    const updatedEvent = await Event.findById(mainEvent._id);

    assert.equal(updatedEvent.reservedSeats, 3);
  });

  await t.test("No permite cancelar nuevamente un ticket cancelado", async () => {
    const response = await request(app)
      .patch(`/api/tickets/${userTicket._id}/cancel`)
      .set("Cookie", authCookie(userToken));

    assert.equal(response.status, 409);
  });

  await t.test("El usuario puede volver a inscribirse después de cancelar", async () => {
    const response = await request(app)
      .post(`/api/events/${mainEvent._id}/tickets`)
      .set("Cookie", authCookie(userToken))
      .send({ quantity: 1 });

    assert.equal(response.status, 201);
    assert.equal(response.body.payload.status, "confirmed");

    const updatedEvent = await Event.findById(mainEvent._id);

    assert.equal(updatedEvent.reservedSeats, 4);
  });

  await t.test("Un administrador puede cancelar el ticket de otro usuario", async () => {
    const response = await request(app)
      .patch(`/api/tickets/${otherUserTicket._id}/cancel`)
      .set("Cookie", authCookie(adminToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.payload.status, "cancelled");

    const updatedEvent = await Event.findById(mainEvent._id);

    assert.equal(updatedEvent.reservedSeats, 1);
  });
});

test("La inscripción se mantiene si falla el envío del correo", async () => {
  const emailFailureEvent = await Event.create({
    ...testEventData,
    title: "Evento de prueba de fallo de correo",
    organizer: organizer._id,
    status: "published",
    capacity: 3,
    reservedSeats: 0
  });

  const result = await createEventTicket(
    emailFailureEvent._id.toString(),
    user._id.toString(),
    2,
    async () => {
      throw new Error("Fallo SMTP simulado");
    }
  );

  assert.equal(result.emailSent, false);
  assert.equal(result.ticket.status, "confirmed");
  assert.equal(result.ticket.quantity, 2);

  const updatedEvent = await Event.findById(emailFailureEvent._id);

  assert.equal(updatedEvent.reservedSeats, 2);
});