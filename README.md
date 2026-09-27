# BackEndII

API REST para una plataforma de eventos e inscripciones.

## Tema

Plataforma de Eventos e Inscripciones.

El proyecto proporciona la estructura inicial de una API REST orientada a la gestión de eventos, usuarios y sesiones.

## Tecnologías

* Node.js
* Express
* JavaScript
* ESM (ECMAScript Modules)
* dotenv
* Nodemon

## Requisitos

* Node.js
* npm

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

## Estructura del proyecto

```text
BackEndII/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── dao/
│   ├── models/
│   ├── middlewares/
│   └── utils/
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

Respuesta inicial:

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

Respuesta inicial:

```json
{
  "status": "success",
  "payload": []
}
```

## Modelos base

Actualmente se incluyen modelos base para:

* User
* Event

Estos modelos forman parte de la estructura inicial y serán ampliados en futuras etapas del proyecto.
