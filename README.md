# BackEndII

API REST para una plataforma de eventos e inscripciones, desarrollada con Node.js, Express y MongoDB.

## Tema

Plataforma de Eventos e Inscripciones.

El proyecto implementa una API REST para gestionar eventos, usuarios y sesiones, utilizando una arquitectura organizada por capas, autenticación mediante Passport y JWT, y autorización basada en roles.

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
- passport-local
- passport-jwt
- Supertest
- Node.js Test Runner

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

### Configuración para pruebas automatizadas

Las pruebas automatizadas utilizan una base de datos independiente de la utilizada por la aplicación.

Crear un archivo `.env.test` en la raíz del proyecto con la siguiente variable:

```env
MONGO_URL=mongodb://localhost:27017/backendii_test
```

La URI debe adaptarse a la configuración local de MongoDB. Si se utiliza MongoDB Atlas, debe apuntar a una base de datos llamada `backendii_test`.

Las pruebas verifican que la conexión corresponda a `backendii_test` antes de ejecutar operaciones de limpieza o modificación de datos.

El archivo `.env.test` contiene configuración local y no debe subirse al repositorio.

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

La autenticación y autorización se complementan mediante middlewares:

- `auth.middleware.js`: verifica el JWT recibido mediante la cookie `currentUser` y establece la identidad autenticada en `req.user`.
- `authorize.middleware.js`: verifica que el rol del usuario esté autorizado para acceder al recurso solicitado.

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
│   │   ├── authorize.middleware.js
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
├── test/
│   ├── events.test.js
│   └── sessions.test.js
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

La entidad `Event` representa los eventos disponibles en la plataforma. Cada evento está asociado a un usuario con rol `organizer`, mediante una referencia ObjectId al modelo `User`.

#### Obtener eventos

`GET /api/events`

No requiere autenticación.

Permite consultar los eventos publicados y finalizados. Los eventos en estado `draft` o `cancelled` no se incluyen en el listado público.

La consulta admite filtros, paginación y ordenamiento.

**Filtros disponibles:**

| Parámetro | Descripción |
|---|---|
| `status` | Filtra por estado `published` o `finished`. |
| `category` | Filtra por categoría. |
| `location` | Filtra por ubicación. |
| `dateFrom` | Fecha mínima del evento. |
| `dateTo` | Fecha máxima del evento. |

Los filtros de categoría y ubicación permiten buscar coincidencias parciales sin distinguir mayúsculas y minúsculas.

**Paginación:**

| Parámetro | Descripción |
|---|---|
| `page` | Número de página. Por defecto: `1`. |
| `limit` | Cantidad de resultados por página. Por defecto: `10`. Máximo: `100`. |

**Ordenamiento:**

El parámetro `sort` permite ordenar los resultados. Se admite el prefijo `-` para indicar orden descendente.

Campos disponibles:

- `date`
- `title`
- `price`
- `capacity`
- `createdAt`

Ejemplos:

```text
GET /api/events?status=published
GET /api/events?category=workshop
GET /api/events?location=Buenos%20Aires
GET /api/events?dateFrom=2027-01-01&dateTo=2027-12-31
GET /api/events?page=2&limit=5
GET /api/events?sort=date
GET /api/events?sort=-price
GET /api/events?status=published&category=workshop&page=2&limit=5
```

La respuesta incluye los eventos encontrados y los datos de paginación:

```json
{
  "status": "success",
  "payload": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

#### Obtener un evento por ID

`GET /api/events/:id`

No requiere autenticación.

Permite consultar un evento individual siempre que se encuentre publicado o finalizado.

Ejemplo:

```text
GET /api/events/665f2a...
```

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a...",
    "title": "Conferencia de tecnología",
    "description": "Encuentro sobre desarrollo de software",
    "category": "Tecnología",
    "date": "2027-06-15T18:00:00.000Z",
    "location": "Buenos Aires",
    "capacity": 50,
    "price": 1000,
    "status": "published",
    "organizer": "665f2a..."
  }
}
```

Si el evento no existe o no está disponible para consulta pública, se devuelve `404 Not Found`.

#### Crear evento

`POST /api/events`

Requiere autenticación y uno de los siguientes roles:

- `organizer`
- `admin`

Cuerpo de la solicitud:

```json
{
  "title": "Conferencia de tecnología",
  "description": "Encuentro sobre desarrollo de software",
  "category": "Tecnología",
  "date": "2027-06-15T18:00:00.000Z",
  "location": "Buenos Aires",
  "capacity": 50,
  "price": 1000
}
```

El sistema obtiene automáticamente el identificador del organizador desde `req.user`.

No permite establecer libremente el organizador mediante el cuerpo de la solicitud.

El estado inicial predeterminado es `draft`. También se admite indicar `published` al crear el evento.

Respuesta exitosa (`201 Created`):

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a...",
    "title": "Conferencia de tecnología",
    "description": "Encuentro sobre desarrollo de software",
    "category": "Tecnología",
    "date": "2027-06-15T18:00:00.000Z",
    "location": "Buenos Aires",
    "capacity": 50,
    "price": 1000,
    "status": "draft",
    "organizer": "665f2a..."
  }
}
```

Un usuario con rol `user` recibe `403 Forbidden`. Una solicitud sin autenticación válida recibe `401 Unauthorized`.

#### Modificar evento

`PUT /api/events/:id`

Requiere autenticación y uno de los siguientes roles:

- `organizer`
- `admin`

Un organizador solamente puede modificar sus propios eventos. Un administrador puede modificar eventos de cualquier organizador.

Se pueden enviar los campos que se desean actualizar, sin necesidad de enviar nuevamente todos los datos.

Ejemplo:

```json
{
  "title": "Conferencia de tecnología actualizada",
  "price": 1500
}
```

No se permite modificar eventos cancelados. El estado del evento debe cambiarse mediante el endpoint específico de modificación de estado.

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a...",
    "title": "Conferencia de tecnología actualizada",
    "price": 1500,
    "status": "published"
  }
}
```

Si el evento no existe, se devuelve `404 Not Found`.

Si un organizador intenta modificar un evento ajeno, se devuelve `403 Forbidden`.

#### Cambiar el estado de un evento

`PATCH /api/events/:id/status`

Requiere autenticación y uno de los siguientes roles:

- `organizer`
- `admin`

El organizador solamente puede cambiar el estado de sus propios eventos. El administrador puede modificar el estado de cualquier evento.

Cuerpo de la solicitud:

```json
{
  "status": "cancelled"
}
```

Los estados permitidos son:

- `draft`
- `published`
- `cancelled`
- `finished`

No se permite modificar el estado de un evento que ya se encuentra cancelado.

Tampoco se permite publicar eventos finalizados o cancelados.

Cancelar un evento significa cambiar su estado a `cancelled`. No se elimina físicamente de la base de datos.

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a...",
    "title": "Conferencia de tecnología",
    "status": "cancelled"
  }
}
```

### Reglas de negocio de eventos

Las validaciones de negocio se implementan en la capa `services`, manteniendo separadas las responsabilidades de rutas, controladores y acceso a datos.

Las principales reglas son:

- La fecha del evento debe ser futura al momento de crearlo.
- No se permite asignar una fecha pasada al modificar un evento.
- La capacidad debe ser un número entero mayor que cero.
- El precio debe ser un número mayor o igual a cero.
- Los campos `title`, `description`, `category` y `location` son obligatorios.
- El estado debe pertenecer a los valores permitidos.
- Al crear un evento, el organizador se obtiene del usuario autenticado.
- Un organizador no puede modificar eventos pertenecientes a otros usuarios.
- Un administrador puede modificar eventos de cualquier organizador.
- Los eventos cancelados no pueden modificarse.
- La cancelación se realiza mediante un cambio de estado y no mediante la eliminación del registro.

### Sesiones y usuarios

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

El rol se asigna desde el servidor, por lo que el cliente no puede registrarse públicamente como `organizer` o `admin` enviando un rol diferente en el cuerpo de la solicitud.

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

La estrategia `login` busca el usuario por email y compara la contraseña con el hash almacenado mediante bcrypt.

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

#### Obtener todos los usuarios

`GET /api/sessions/users`

Requiere autenticación y el rol `admin`.

Permite consultar los usuarios registrados en el sistema.

Los usuarios que no tengan el rol `admin` reciben `403 Forbidden`. Las solicitudes sin autenticación reciben `401 Unauthorized`.

La información devuelta no incluye las contraseñas almacenadas.

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "665f2a...",
      "first_name": "Ana",
      "last_name": "Pérez",
      "email": "ana@mail.com",
      "role": "user"
    }
  ]
}
```

## Roles y autorización

El sistema utiliza tres roles para controlar el acceso a las funcionalidades:

| Acción | `user` | `organizer` | `admin` |
|---|---|---|---|
| Consultar eventos públicos | Sí | Sí | Sí |
| Crear eventos | No | Sí | Sí |
| Modificar eventos propios | No | Sí | Sí |
| Modificar eventos ajenos | No | No | Sí |
| Cambiar el estado de eventos propios | No | Sí | Sí |
| Cambiar el estado de eventos ajenos | No | No | Sí |
| Consultar todos los usuarios | No | No | Sí |

El registro público siempre asigna el rol `user`.

La autorización se implementa mediante `authorize.middleware.js`, que recibe los roles permitidos para cada ruta.

El control de propiedad de los eventos se realiza comparando el identificador del organizador del evento con el identificador del usuario autenticado. Los administradores no están sujetos a esta restricción.

### Códigos de autorización

- `401 Unauthorized`: la solicitud no cuenta con una autenticación válida, por ejemplo, cuando no existe una cookie de sesión o el JWT es inválido.
- `403 Forbidden`: el usuario está autenticado, pero no tiene los permisos necesarios para realizar la operación.

## Autenticación con Passport y JWT

La autenticación se centraliza en `src/config/passport.config.js`. Passport se inicializa en `src/app.js` mediante `passport.initialize()`, después de `cookie-parser`.

### Estrategias configuradas

- **`register` (`passport-local`):** utiliza `LocalStrategy` para validar los datos del registro, normalizar el email, comprobar duplicados, generar el hash de la contraseña y asignar el rol `user`.
- **`login` (`passport-local`):** utiliza `LocalStrategy` para validar las credenciales y comparar la contraseña enviada con el hash almacenado.
- **`current` (`passport-jwt`):** extrae el JWT de la cookie `currentUser`, verifica su validez y proporciona los datos de identidad autenticados.

Las estrategias locales utilizan `email` como campo de usuario (`usernameField`) y `password` como campo de contraseña (`passwordField`).

El token se genera mediante `jsonwebtoken` en `src/utils/jwt.js`. Se firma con `JWT_SECRET`, incluye `id`, `email` y `role`, y utiliza la duración configurada por `JWT_EXPIRES_IN`, cuyo valor predeterminado es `1h`.

La cookie utiliza las opciones `HttpOnly` y `SameSite=Lax`; `Secure` se activa en producción. El endpoint de logout elimina la cookie.

Las contraseñas se almacenan mediante bcrypt y nunca se guardan en texto plano.

## Pruebas automatizadas

El proyecto incorpora pruebas automatizadas para verificar el funcionamiento de los endpoints de registro, login, gestión de sesiones, autorización por roles, control de propiedad de eventos y reglas de negocio.

Las pruebas se implementan con:

- **Node.js Test Runner:** ejecución y organización de las pruebas.
- **Supertest:** realización de solicitudes HTTP a la aplicación Express.
- **Mongoose:** verificación de los datos persistidos en MongoDB.

Los archivos de pruebas se encuentran en la carpeta `test/`:

- `sessions.test.js`
- `events.test.js`

Para ejecutar las pruebas:

```bash
npm test
```

El comando utiliza el archivo `.env.test` para conectarse a la base de datos independiente `backendii_test`.

### Casos cubiertos

**Registro de usuarios:**

- Registro correcto de un usuario: `201 Created`.
- Asignación del rol `user`.
- Ausencia de la contraseña en la respuesta.
- Almacenamiento de la contraseña mediante hash.
- Rechazo de un email duplicado: `409 Conflict`.

**Inicio de sesión y gestión de sesiones:**

- Login con credenciales correctas: `200 OK`.
- Generación de la cookie `currentUser`.
- Verificación del atributo `HttpOnly`.
- Rechazo de una contraseña incorrecta: `401 Unauthorized`.
- Rechazo del acceso a `/api/sessions/current` sin cookie: `401 Unauthorized`.
- Acceso a `/api/sessions/current` después de un login correcto: `200 OK`.
- Ausencia de la contraseña en los datos del usuario autenticado.
- Cierre de sesión mediante logout.
- Rechazo del acceso a `/api/sessions/current` después del logout: `401 Unauthorized`.

**Autorización para crear eventos:**

- Rechazo de la creación de eventos por parte de un usuario común: `403 Forbidden`.
- Creación de eventos por parte de un organizador: `201 Created`.
- Creación de eventos por parte de un administrador: `201 Created`.
- Rechazo de la creación de eventos sin autenticación: `401 Unauthorized`.

**Acceso a la lista de usuarios:**

- Rechazo del acceso por parte de un organizador: `403 Forbidden`.
- Acceso permitido para un administrador: `200 OK`.
- Ausencia de contraseñas en los datos devueltos.
- Rechazo del acceso sin autenticación: `401 Unauthorized`.

**Control de propiedad de eventos:**

- Rechazo de la modificación de un evento ajeno por parte de un organizador: `403 Forbidden`.
- Modificación permitida de un evento propio por parte de su organizador: `200 OK`.
- Modificación permitida de un evento ajeno por parte de un administrador: `200 OK`.
- Rechazo de modificaciones de eventos cancelados.

**Validaciones y reglas de negocio:**

- Rechazo de fechas pasadas al crear eventos.
- Rechazo de capacidades iguales o inferiores a cero.
- Rechazo de precios negativos.
- Validación de estados permitidos.
- Rechazo de estados no disponibles en el listado público.
- Rechazo de intentos de volver a publicar eventos finalizados o cancelados.
- Validación de filtros, paginación y ordenamiento.

Las pruebas utilizan usuarios y eventos específicos para los casos automatizados y eliminan únicamente los registros asociados a dichos usuarios al preparar y finalizar la ejecución.

La conexión a la base de datos de pruebas se verifica antes de realizar operaciones de limpieza, evitando ejecutar estas operaciones sobre la base de datos habitual.

En la última ejecución se verificaron **47 pruebas aprobadas y 0 fallidas**.

## Proveedores externos futuros

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

Los errores de validación de datos se responden con `400 Bad Request`. Los identificadores con formato inválido también se responden con `400 Bad Request`.

Los errores de autenticación y autorización mantienen la diferencia entre `401 Unauthorized` y `403 Forbidden`.

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

- `title`: título del evento.
- `description`: descripción.
- `category`: categoría.
- `date`: fecha y hora del evento.
- `location`: ubicación.
- `capacity`: capacidad máxima, expresada como un número entero mayor que cero.
- `price`: precio, que debe ser mayor o igual a cero.
- `status`: estado del evento.
- `organizer`: referencia ObjectId al modelo `User`.

El campo `status` permite los siguientes valores:

- `draft`
- `published`
- `cancelled`
- `finished`

Por defecto, los eventos se crean con estado `draft`.

El campo `organizer` almacena una referencia al usuario que creó el evento, no el objeto completo del usuario.

Los modelos se encuentran en `src/models/`.
