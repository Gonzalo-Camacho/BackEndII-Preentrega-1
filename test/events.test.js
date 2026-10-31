
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";

import app from "../src/app.js";
import User from "../src/models/User.js";
import Event from "../src/models/Event.js";
import { MONGO_URL } from "../src/config/env.config.js";
import { generateToken } from "../src/utils/jwt.js";

const testEmails = [
  "autotest-user-events@example.com",
  "autotest-organizer-events@example.com",
  "autotest-admin-events@example.com"
];

let user;
let organizer;
let admin;
let userToken;
let organizerToken;
let adminToken;
let organizerEvent;
let anotherEvent;
let cancelledEvent;
let draftEvent;

const testEventData = {
  title: "Evento de prueba",
  description: "Descripción del evento automatizado",
  category: "Tecnología",
  date: "2027-06-15T18:00:00.000Z",
  location: "Buenos Aires",
  capacity: 50,
  price: 1000
};

const authCookie = (token) => `currentUser=${token}`;

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

  organizer = await User.create({
    first_name: "Organizador",
    last_name: "Prueba",
    email: testEmails[1],
    password: "PasswordTest123",
    role: "organizer"
  });

  admin = await User.create({
    first_name: "Administrador",
    last_name: "Prueba",
    email: testEmails[2],
    password: "PasswordTest123",
    role: "admin"
  });

  userToken = generateToken(user);
  organizerToken = generateToken(organizer);
  adminToken = generateToken(admin);

  organizerEvent = await Event.create({
    ...testEventData,
    title: "Evento propio del organizador",
    organizer: organizer._id,
    status: "published"
  });

  anotherEvent = await Event.create({
    ...testEventData,
    title: "Evento de otro organizador",
    organizer: user._id,
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
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name === "backendii_test") {
      await Event.deleteMany({
        organizer: {
          $in: [user?._id, organizer?._id, admin?._id]
        }
      });

      await User.deleteMany({
        email: { $in: testEmails }
      });
    }

    await mongoose.disconnect();
  }
});

test("Autorización para crear eventos", async (t) => {
  await t.test("Un usuario común no puede crear eventos", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(userToken))
      .send(testEventData);

    assert.equal(response.status, 403);
  });

  await t.test("Un organizador puede crear eventos", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(organizerToken))
      .send(testEventData);

    assert.equal(response.status, 201);
    assert.equal(response.body.status, "success");
    assert.equal(
      response.body.payload.organizer.toString(),
      organizer._id.toString()
    );
  });

  await t.test("Un administrador puede crear eventos", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(adminToken))
      .send(testEventData);

    assert.equal(response.status, 201);
    assert.equal(response.body.status, "success");
  });

  await t.test("No permite crear eventos sin autenticación", async () => {
    const response = await request(app)
      .post("/api/events")
      .send(testEventData);

    assert.equal(response.status, 401);
  });

  await t.test("No permite crear eventos con fecha pasada", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(organizerToken))
      .send({
        ...testEventData,
        date: "2020-01-01T18:00:00.000Z"
      });

    assert.equal(response.status, 400);
  });

  await t.test("No permite crear eventos con capacidad inválida", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(organizerToken))
      .send({
        ...testEventData,
        capacity: 0
      });

    assert.equal(response.status, 400);
  });

  await t.test("No permite crear eventos con precio negativo", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(organizerToken))
      .send({
        ...testEventData,
        price: -100
      });

    assert.equal(response.status, 400);
  });

  await t.test("El organizador no puede asignarse otro organizador desde el body", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Cookie", authCookie(organizerToken))
      .send({
        ...testEventData,
        organizer: user._id
      });

    assert.equal(response.status, 201);
    assert.equal(
      response.body.payload.organizer.toString(),
      organizer._id.toString()
    );
  });
});

test("Acceso a la lista de usuarios", async (t) => {
  await t.test("Un organizador no puede consultar todos los usuarios", async () => {
    const response = await request(app)
      .get("/api/sessions/users")
      .set("Cookie", authCookie(organizerToken));

    assert.equal(response.status, 403);
  });

  await t.test("Un administrador puede consultar todos los usuarios", async () => {
    const response = await request(app)
      .get("/api/sessions/users")
      .set("Cookie", authCookie(adminToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");

    assert.ok(
      response.body.payload.some(
        (item) => item.email === testEmails[0]
      )
    );

    for (const item of response.body.payload) {
      assert.equal(Object.hasOwn(item, "password"), false);
    }
  });

  await t.test("No permite consultar usuarios sin autenticación", async () => {
    const response = await request(app)
      .get("/api/sessions/users");

    assert.equal(response.status, 401);
  });
});

test("Control de propiedad de eventos", async (t) => {
  await t.test("Un organizador no puede modificar un evento ajeno", async () => {
    const response = await request(app)
      .put(`/api/events/${anotherEvent._id}`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        title: "Intento de modificación no autorizado"
      });

    assert.equal(response.status, 403);
  });

  await t.test("Un organizador puede modificar su propio evento", async () => {
    const response = await request(app)
      .put(`/api/events/${organizerEvent._id}`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        title: "Evento propio modificado"
      });

    assert.equal(response.status, 200);
    assert.equal(
      response.body.payload.title,
      "Evento propio modificado"
    );
  });

  await t.test("Un administrador puede modificar un evento ajeno", async () => {
    const response = await request(app)
      .put(`/api/events/${anotherEvent._id}`)
      .set("Cookie", authCookie(adminToken))
      .send({
        title: "Evento modificado por administrador"
      });

    assert.equal(response.status, 200);
    assert.equal(
      response.body.payload.title,
      "Evento modificado por administrador"
    );
  });

  await t.test("No se puede modificar un evento cancelado", async () => {
    const response = await request(app)
      .put(`/api/events/${cancelledEvent._id}`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        title: "Intento de modificar evento cancelado"
      });

    assert.equal(response.status, 400);
  });

  await t.test("No se puede modificar el organizador mediante PUT", async () => {
    const response = await request(app)
      .put(`/api/events/${organizerEvent._id}`)
      .set("Cookie", authCookie(adminToken))
      .send({
        organizer: user._id
      });

    assert.equal(response.status, 200);

    const updatedEvent = await Event.findById(organizerEvent._id);

    assert.equal(
      updatedEvent.organizer.toString(),
      organizer._id.toString()
    );
  });
});

test("Consulta pública de eventos", async (t) => {
  await t.test("Se pueden consultar los eventos publicados", async () => {
    const response = await request(app)
      .get("/api/events");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");
    assert.ok(Array.isArray(response.body.payload));

    assert.ok(
      response.body.payload.every(
        (event) => ["published", "finished"].includes(event.status)
      )
    );
  });

  await t.test("Se puede consultar un evento publicado por ID", async () => {
    const response = await request(app)
      .get(`/api/events/${organizerEvent._id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");
    assert.equal(
      response.body.payload._id,
      organizerEvent._id.toString()
    );
  });

  await t.test("No se puede consultar públicamente un evento en borrador", async () => {
    const response = await request(app)
      .get(`/api/events/${draftEvent._id}`);

    assert.equal(response.status, 404);
  });

  await t.test("No se puede consultar públicamente un evento cancelado", async () => {
    const response = await request(app)
      .get(`/api/events/${cancelledEvent._id}`);

    assert.equal(response.status, 404);
  });

  await t.test("Se puede filtrar por categoría", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ category: "Tecnología" });

    assert.equal(response.status, 200);
    assert.ok(
      response.body.payload.every(
        (event) => event.category === "Tecnología"
      )
    );
  });

  await t.test("Se puede filtrar por ubicación", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ location: "Buenos Aires" });

    assert.equal(response.status, 200);
    assert.ok(
      response.body.payload.every(
        (event) => event.location === "Buenos Aires"
      )
    );
  });

  await t.test("Se puede filtrar por estado publicado", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ status: "published" });

    assert.equal(response.status, 200);
    assert.ok(
      response.body.payload.every(
        (event) => event.status === "published"
      )
    );
  });

  await t.test("No se pueden listar eventos en borrador", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ status: "draft" });

    assert.equal(response.status, 400);
  });

  await t.test("La respuesta incluye información de paginación", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ page: 1, limit: 2 });

    assert.equal(response.status, 200);
    assert.equal(response.body.page, 1);
    assert.equal(response.body.limit, 2);
    assert.equal(typeof response.body.total, "number");
    assert.equal(typeof response.body.totalPages, "number");
    assert.ok(response.body.payload.length <= 2);
  });

  await t.test("No permite una página inválida", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ page: 0 });

    assert.equal(response.status, 400);
  });

  await t.test("No permite un límite superior a 100", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ limit: 101 });

    assert.equal(response.status, 400);
  });

  await t.test("No permite un criterio de ordenamiento inválido", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ sort: "password" });

    assert.equal(response.status, 400);
  });
});

test("Cambio de estado de eventos", async (t) => {
  await t.test("Un organizador puede cancelar su evento", async () => {
    const response = await request(app)
      .patch(`/api/events/${organizerEvent._id}/status`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        status: "cancelled"
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.payload.status, "cancelled");
  });

  await t.test("No se puede modificar el estado de un evento cancelado", async () => {
    const response = await request(app)
      .patch(`/api/events/${organizerEvent._id}/status`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        status: "published"
      });

    assert.equal(response.status, 400);
  });

  await t.test("Un usuario común no puede cambiar el estado de un evento", async () => {
    const response = await request(app)
      .patch(`/api/events/${anotherEvent._id}/status`)
      .set("Cookie", authCookie(userToken))
      .send({
        status: "cancelled"
      });

    assert.equal(response.status, 403);
  });

  await t.test("No se puede publicar un evento con estado finalizado", async () => {
    const finishedEvent = await Event.create({
      ...testEventData,
      title: "Evento finalizado",
      organizer: organizer._id,
      status: "finished"
    });

    const response = await request(app)
      .patch(`/api/events/${finishedEvent._id}/status`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        status: "published"
      });

    assert.equal(response.status, 400);
  });
});
