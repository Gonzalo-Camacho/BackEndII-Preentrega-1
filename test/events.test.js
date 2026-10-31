
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

const testEventData = {
  title: "Evento de prueba",
  description: "Descripción del evento automatizado",
  date: "2027-06-15T18:00:00.000Z",
  location: "Buenos Aires",
  capacity: 50
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
    organizer: organizer._id
  });

  anotherEvent = await Event.create({
    ...testEventData,
    title: "Evento de otro organizador",
    organizer: user._id
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
      .patch(`/api/events/${anotherEvent._id}`)
      .set("Cookie", authCookie(organizerToken))
      .send({
        title: "Intento de modificación no autorizado"
      });

    assert.equal(response.status, 403);
  });

  await t.test("Un organizador puede modificar su propio evento", async () => {
    const response = await request(app)
      .patch(`/api/events/${organizerEvent._id}`)
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
      .patch(`/api/events/${anotherEvent._id}`)
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
});
