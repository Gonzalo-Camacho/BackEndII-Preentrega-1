# BackEndII

API REST para una plataforma de eventos e inscripciones.

## Tema

Plataforma de Eventos e Inscripciones.

El proyecto implementa una API REST orientada a la gestión de eventos, usuarios y sesiones, utilizando una arquitectura organizada por capas.

## Tecnologías

* Node.js
* Express
* JavaScript
* ESM (ECMAScript Modules)
* Mongoose
* MongoDB
* bcrypt
* dotenv
* Nodemon

## Requisitos

* Node.js
* npm
* MongoDB

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

Crear un archivo `.env` a partir de `.env.example`.

Variables disponibles:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/backendii
JWT_SECRET=change_this_secret
```

El archivo `.env` no debe subirse al repositorio.

La configuración de las variables de entorno se centraliza en:

```text
src/config/env.config.js
```

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

```text
http://localhost:8080
```

## Arquitectura

El proyecto utiliza una arquitectura por capas para separar las responsabilidades de la aplicación.

Para los recursos que utilizan persistencia, el flujo es:

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

Los controladores reciben las solicitudes HTTP y delegan la lógica a los servicios. Los servicios contienen la lógica de negocio y utilizan repositorios y DAO para acceder a los modelos de datos.

El registro de usuarios utiliza el siguiente flujo:

```text
sessions.router.js
→ sessions.controller.js
→ sessions.service.js
→ users.repository.js
→ users.dao.js
→ User.js
```

El hash de contraseñas se realiza mediante un helper reutilizable ubicado en:

```text
src/utils/hash.js
```

## Estructura del proyecto

```text
BackEndII/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.config.js
│   │   └── env.config.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── dao/
│   │   ├── event.dao.js
│   │   └── users.dao.js
│   ├── middlewares/
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
│       └── hash.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Rutas disponibles

### Health check

```http
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### Eventos

```http
GET /api/events
```

Este endpoint utiliza la arquitectura por capas:

```text
events.router.js
→ events.controller.js
→ events.service.js
→ event.repository.js
→ event.dao.js
→ Event.js
```

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

### Sesiones

#### Obtener sesiones

```http
GET /api/sessions
```

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

#### Registrar usuario

```http
POST /api/sessions/register
```

Este endpoint permite registrar un nuevo usuario.

El cuerpo de la solicitud debe contener:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Los campos obligatorios son:

* `first_name`
* `last_name`
* `email`
* `password`

El email se normaliza eliminando espacios y convirtiéndolo a minúsculas.

La contraseña se almacena utilizando un hash generado con `bcrypt`.

El rol no puede ser definido durante el registro público. Todos los usuarios registrados mediante este endpoint reciben:

```json
"role": "user"
```

Respuesta exitosa:

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

La contraseña nunca se incluye en la respuesta.

### Validaciones del registro

El endpoint valida:

* presencia de los campos obligatorios;
* formato del email;
* longitud mínima de la contraseña;
* emails duplicados.

Para un email ya registrado se devuelve:

```http
409 Conflict
```

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

Para datos inválidos se devuelve:

```http
400 Bad Request
```

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

Los errores generados durante el procesamiento de las solicitudes son derivados al middleware centralizado:

```text
src/middlewares/error.middleware.js
```

## Modelos

El proyecto utiliza Mongoose para definir modelos con esquemas y validaciones.

### User

El modelo `User` incluye:

* `first_name`
* `last_name`
* `email`
* `password`
* `role`

El esquema incluye:

* campos obligatorios;
* restricciones de longitud;
* email único;
* email normalizado;
* contraseña con longitud mínima;
* valores permitidos para el rol (`user`, `organizer`, `admin`);
* rol `user` por defecto.

Las contraseñas se almacenan utilizando `bcrypt`.

### Event

El modelo `Event` incluye:

* `title`
* `description`
* `date`
* `location`
* `capacity`

El esquema incluye campos obligatorios, restricciones de longitud y validación de capacidad mínima.

Los modelos se encuentran en:

```text
src/models/
```
