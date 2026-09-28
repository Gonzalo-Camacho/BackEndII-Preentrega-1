# BackEndII

API REST para una plataforma de eventos e inscripciones.

## Tema

Plataforma de Eventos e Inscripciones.

El proyecto implementa la estructura de una API REST orientada a la gestión de eventos, usuarios y sesiones, utilizando una arquitectura organizada por capas.

## Tecnologías

* Node.js
* Express
* JavaScript
* ESM (ECMAScript Modules)
* Mongoose
* MongoDB
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

Para el recurso `events`, el flujo es:

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

Los controladores reciben las solicitudes HTTP y delegan la lógica a los servicios. Los servicios utilizan repositorios y DAO para acceder a los modelos de datos.

El recurso `sessions` actualmente utiliza:

```text
Route
  ↓
Controller
  ↓
Service
```

## Estructura del proyecto

```text
BackEndII/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.config.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── dao/
│   │   └── event.dao.js
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── repositories/
│   │   └── event.repository.js
│   ├── routes/
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   └── services/
│       ├── events.service.js
│       └── sessions.service.js
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

```http
GET /api/sessions
```

Este endpoint delega desde el controller hacia el service.

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

## Manejo de errores

La aplicación cuenta con middleware centralizado para el manejo de errores.

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

* `firstName`
* `lastName`
* `email`
* `password`
* `role`

El esquema incluye campos obligatorios, restricciones de longitud, email único y valores permitidos para el rol.

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
