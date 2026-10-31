import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";

import app from "../src/app.js";
import User from "../src/models/User.js";
import { MONGO_URL } from "../src/config/env.config.js";

const testEmails = [
  "autotest-backendii-register@example.com"
];

before(async () => {
  await mongoose.connect(MONGO_URL);

  assert.equal(
    mongoose.connection.name,
    "backendii_test",
    "ERROR: las pruebas deben ejecutarse exclusivamente sobre backendii_test"
  );

  console.log("Conectado a la base de datos de pruebas");

  await User.deleteMany({
    email: { $in: testEmails }
  });
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name === "backendii_test") {
      await User.deleteMany({
        email: { $in: testEmails }
      });
    }

    await mongoose.disconnect();
  }
});

test("Registro de usuarios", async (t) => {
  await t.test("Registra un usuario correctamente", async () => {
    const response = await request(app)
      .post("/api/sessions/register")
      .send({
        first_name: "Usuario",
        last_name: "Automatizado",
        email: testEmails[0],
        password: "ClaveTest123"
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.payload.email, testEmails[0]);
    assert.equal(response.body.payload.role, "user");

    assert.equal(
      Object.hasOwn(response.body.payload, "password"),
      false
    );

    const savedUser = await User.findOne({
      email: testEmails[0]
    });

    assert.ok(savedUser);
    assert.notEqual(savedUser.password, "ClaveTest123");
  });

  await t.test("Rechaza un email duplicado", async () => {
    const response = await request(app)
      .post("/api/sessions/register")
      .send({
        first_name: "Otro",
        last_name: "Usuario",
        email: testEmails[0],
        password: "OtraClave123"
      });

    assert.equal(response.status, 409);
    assert.equal(response.body.status, "error");
  });
});

test("Inicio de sesión", async (t) => {
  await t.test("Inicia sesión con credenciales correctas", async () => {
    const response = await request(app)
      .post("/api/sessions/login")
      .send({
        email: testEmails[0],
        password: "ClaveTest123"
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");

    const cookies = response.headers["set-cookie"];

    assert.ok(cookies);

    const currentUserCookie = cookies.find((cookie) =>
      cookie.startsWith("currentUser=")
    );

    assert.ok(currentUserCookie);
    assert.match(currentUserCookie, /HttpOnly/i);
  });

  await t.test("Rechaza una contraseña incorrecta", async () => {
    const response = await request(app)
      .post("/api/sessions/login")
      .send({
        email: testEmails[0],
        password: "ContraseñaIncorrecta"
      });

    assert.equal(response.status, 401);
    assert.equal(response.body.status, "error");
  });
});

test("Gestión de sesión", async (t) => {
  const agent = request.agent(app);

  await t.test("Rechaza el acceso a /current sin cookie", async () => {
    const response = await request(app)
      .get("/api/sessions/current");

    assert.equal(response.status, 401);
  });

  await t.test("Permite consultar /current después del login", async () => {
    await agent
      .post("/api/sessions/login")
      .send({
        email: testEmails[0],
        password: "ClaveTest123"
      });

    const response = await agent
      .get("/api/sessions/current");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "success");
    assert.equal(response.body.payload.email, testEmails[0]);
    assert.equal(response.body.payload.role, "user");

    assert.equal(
      Object.hasOwn(response.body.payload, "password"),
      false
    );
  });

  await t.test("Cierra la sesión y rechaza el acceso posterior", async () => {
    const logoutResponse = await agent
      .post("/api/sessions/logout");

    assert.equal(logoutResponse.status, 200);

    const currentResponse = await agent
      .get("/api/sessions/current");

    assert.equal(currentResponse.status, 401);
  });
});
