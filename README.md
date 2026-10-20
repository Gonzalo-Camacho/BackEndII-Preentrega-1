# BackEndII

API REST para una plataforma de eventos e inscripciones, desarrollada con Node.js, Express y MongoDB.

## Tema

Plataforma de Eventos e Inscripciones.

El proyecto implementa una API REST para gestionar eventos, usuarios y sesiones, utilizando una arquitectura organizada por capas.

## Tecnologías

- Node.js
- Express
- JavaScript con módulos ESM
- Mongoose
- MongoDB
- bcrypt
- dotenv
- Nodemon
- jsonwebtoken
- cookie-parser
- Passport.js
- passport-custom
- passport-jwt

## Requisitos

- Node.js
- npm
- MongoDB

## Instalación

Clonar el repositorio y acceder a la carpeta del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd BackEndII
```

Instalar las dependencias:

```bash
npm install
```

## Configuración de variables de entorno

Crear un archivo `.env` a partir de `.env.example` y configurar las variables para el entorno local.

Variables utilizadas por la aplicación:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/backendii
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1h
```

Estos valores son ilustrativos. Deben adaptarse a la configuración local, especialmente `MONGO_URL` y `JWT_SECRET`. No se deben publicar credenciales reales.

El archivo `.env` no debe subirse al repositorio. La configuración se centraliza en `src/config/env.config.js`.

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

Para iniciar el servidor en modo desarrollo con Nodemon:

```bash
npm run dev
```

Por defecto, el servidor se ejecuta en:

`http://localhost:8080`

## Arquitectura

El proyecto utiliza una arquitectura por capas para separar responsabilidades.

Para los recursos que utilizan persistencia, el flujo general es:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model
```

Los controladores reciben las solicitudes HTTP y gestionan las respuestas. Los servicios contienen la lógica de negocio y utilizan repositorios y DAO para acceder a los modelos de datos.

Las estrategias de autenticación se configuran en `src/config/passport.config.js`. Las estrategias de registro y login utilizan el repositorio de usuarios para consultar y guardar información.

El hash y la comparación de contraseñas se realizan mediante helpers ubicados en `src/utils/hash.js`.

## Estructura del proyecto

```text
BackEndII/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.config.js
│   │   ├── env.config.js
│   │   └── passport.config.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── dao/
│   │   ├── event.dao.js
│   │   └── users.dao.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── repositories/
│   │   ├── event.repository.js
│   │   └── users.repository.js
│   ├── routes/
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── services/
│   │   ├── events.service.js
│   │   └── sessions.service.js
│   └── utils/
│       ├── hash.js
│       └── jwt.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Rutas disponibles

### Health check

`GET /api/health`

Comprueba que el servidor está activo.

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### Eventos

`GET /api/events`

Obtiene los eventos mediante la arquitectura por capas.

Flujo:

```text
events.router.js
→ events.controller.js
→ events.service.js
→ event.repository.js
→ event.dao.js
→ Event.js
```

Respuesta ilustrativa cuando no hay eventos:

```json
{
  "status": "success",
  "payload": []
}
```

### Sesiones

#### Obtener sesiones

`GET /api/sessions`

Obtiene la información de sesiones que expone el servicio.

#### Registrar usuario

`POST /api/sessions/register`

Permite registrar un nuevo usuario.

Cuerpo de la solicitud:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Los campos obligatorios son `first_name`, `last_name`, `email` y `password`.

La estrategia `register` de Passport:

- Valida la presencia de los campos obligatorios.
- Comprueba el formato del email.
- Exige una contraseña de al menos seis caracteres.
- Elimina espacios externos del email y lo convierte a minúsculas.
- Comprueba que el email no esté registrado.
- Genera un hash de la contraseña con bcrypt.
- Asigna el rol `user` a los usuarios registrados públicamente.

Respuesta exitosa (`201 Created`):

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña no se incluye en la respuesta.

Si faltan campos o hay datos inválidos, se devuelve `400 Bad Request`. Si el email ya está registrado, se devuelve `409 Conflict`.

#### Inicio de sesión

`POST /api/sessions/login`

Permite iniciar sesión con un usuario registrado.

Cuerpo de la solicitud:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

La estrategia `login` busca el usuario por email y compara la contraseña con el hash almacenado.

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

La respuesta establece una cookie llamada `currentUser` que contiene un JWT. La cookie utiliza `HttpOnly`, `SameSite=Lax` y una duración de una hora. En producción también utiliza el atributo `Secure`.

Si faltan campos obligatorios, se devuelve `400 Bad Request`. Si el usuario no existe o la contraseña es incorrecta, se devuelve `401 Unauthorized` con el mensaje genérico `Credenciales inválidas`.

#### Obtener el usuario autenticado

`GET /api/sessions/current`

Requiere una cookie `currentUser` con un JWT válido.

La estrategia `current` de Passport verifica el token extraído de la cookie y coloca la identidad autenticada en `req.user`.

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Si la cookie no existe o el token es inválido o ha expirado, se devuelve `401 Unauthorized`.

#### Cerrar sesión

`POST /api/sessions/logout`

Elimina la cookie `currentUser`.

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

## Autenticación con Passport y JWT

La autenticación se centraliza en `src/config/passport.config.js`. Passport se inicializa en `src/app.js` mediante `passport.initialize()`, después de `cookie-parser`.

### Estrategias configuradas

- **`register` (`passport-custom`):** valida los datos del registro, normaliza el email, comprueba duplicados, genera el hash de la contraseña y asigna el rol `user`.
- **`login` (`passport-custom`):** valida las credenciales comparando la contraseña enviada con el hash almacenado.
- **`current` (`passport-jwt`):** extrae el JWT de la cookie `currentUser`, verifica su validez y proporciona los datos de identidad autenticados.

El token se genera mediante `jsonwebtoken` en `src/utils/jwt.js`. Se firma con `JWT_SECRET`, incluye `id`, `email` y `role`, y utiliza la duración configurada por `JWT_EXPIRES_IN`, cuyo valor predeterminado es `1h`.

La cookie utiliza las opciones `HttpOnly` y `SameSite=Lax`; `Secure` se activa en producción. El endpoint de logout elimina la cookie.

Las contraseñas se almacenan mediante bcrypt y nunca se guardan en texto plano.

### Pruebas realizadas

Se verificaron los siguientes casos:

- Registro correcto: `201 Created`.
- Login correcto: `200 OK`.
- `/api/sessions/current` con cookie válida: `200 OK`.
- Logout correcto: `200 OK`.
- `/api/sessions/current` después del logout: `401 Unauthorized`.
- Login con contraseña incorrecta: `401 Unauthorized`.
- Registro con email duplicado: `409 Conflict`.

### Proveedores externos futuros

La arquitectura podría ampliarse con estrategias Passport para proveedores como Google o GitHub. Esto requeriría configurar las credenciales del proveedor, implementar las rutas y el flujo de autorización, y vincular la identidad externa con un usuario local.

Estos proveedores son una posible extensión futura; no están implementados en esta versión.

## Manejo de errores

La aplicación cuenta con un middleware centralizado para el manejo de errores.

Las rutas inexistentes generan una respuesta HTTP `404`.

Ejemplo:

```json
{
  "status": "error",
  "message": "Ruta no encontrada: GET /api/ruta-inexistente"
}
```

Los errores generados durante el procesamiento de las solicitudes se derivan al middleware centralizado ubicado en `src/middlewares/error.middleware.js`.

## Modelos

El proyecto utiliza Mongoose para definir modelos con esquemas y validaciones.

### User

El modelo `User` incluye:

- `first_name`
- `last_name`
- `email`
- `password`
- `role`

El esquema incluye campos obligatorios, restricciones de longitud, email único y normalizado, longitud mínima de contraseña y valores permitidos para el rol (`user`, `organizer`, `admin`). El rol predeterminado es `user`.

### Event

El modelo `Event` incluye:

- `title`
- `description`
- `date`
- `location`
- `capacity`

El esquema incluye campos obligatorios, restricciones de longitud y validación de capacidad mínima.

Los modelos se encuentran en `src/models/`.
