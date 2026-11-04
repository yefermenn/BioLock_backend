# Guía de pruebas de la API BioLock en Postman

## 1. Base URL

Usa esta URL base en Postman:

```http
http://localhost:3000/api/v1
```

Si usas un entorno distinto, cambia el host y conserva el prefijo `/api/v1`.

---

## 2. Variables de entorno en Postman

Crea un entorno con estas variables:

- `baseUrl` = `http://localhost:3000/api/v1`
- `token` = vacío al inicio
- `refreshToken` = vacío al inicio

Opcionalmente también puedes definir:

- `userId`
- `roleId`
- `zoneId`
- `deviceId`
- `alarmId`

---

## 3. Login y obtención del token

### Request

Method: `POST`
URL: `{{baseUrl}}/auth/login`
Headers:

```http
Content-Type: application/json
```

Body (JSON):

```json
{
  "usuario": "qa@biolock.test",
  "contrasena": "Pruebas123!"
}
```

### Respuesta esperada

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "usuario": {
    "id": 2,
    "nombre": "QA Test",
    "correo": "qa@biolock.test",
    "roles": ["superadmin"],
    "permisos": ["ver_usuarios", "gestionar_usuarios", "..."]
  }
}
```

### Script de Postman para guardar el token

En la pestaña `Tests` del request de login agrega:

```javascript
const res = pm.response.json();
if (res.access_token) {
  pm.environment.set('token', res.access_token);
}
if (res.refresh_token) {
  pm.environment.set('refreshToken', res.refresh_token);
}
```

---

## 4. Autenticación para todas las demás peticiones

Agrega este header a cada request protegida:

```http
Authorization: Bearer {{token}}
```

Y, si tu request es JSON:

```http
Content-Type: application/json
```

---

## 5. Endpoints validados y ejemplos de uso

### 5.1 Salud

#### GET /salud

- URL: `{{baseUrl}}/salud`
- Sin token
- Status esperado: `200`

Respuesta esperada:

```json
{
  "ok": true,
  "servicio": "BioLock backend",
  "timestamp": "2026-11-04T19:21:12.851Z",
  "version": "1.0.0"
}
```

---

### 5.2 Auth

#### GET /auth/me

- URL: `{{baseUrl}}/auth/me`
- Auth: sí
- Status esperado: `200`

#### POST /auth/refresh

```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json
```

Body:

```json
{
  "refresh_token": "{{refreshToken}}"
}
```

Status esperado: `201` o `200` dependiendo del flujo real.

#### POST /auth/logout

```http
POST {{baseUrl}}/auth/logout
Content-Type: application/json
```

Body:

```json
{
  "refresh_token": "{{refreshToken}}"
}
```

Status esperado: `204`

#### PATCH /auth/me/password

```http
PATCH {{baseUrl}}/auth/me/password
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "actual": "Pruebas123!",
  "nueva": "NuevaPass2026!"
}
```

Status esperado: `204`

> Usa esta ruta solo en un entorno local o de prueba. Cambia la contraseña solo cuando tengas claro que no vas a romper el entorno de pruebas.

---

### 5.3 Usuarios

#### GET /usuarios

- URL: `{{baseUrl}}/usuarios`
- Permiso necesario: `ver_usuarios`
- Status: `200`

#### GET /usuarios/:id

```http
GET {{baseUrl}}/usuarios/2
Authorization: Bearer {{token}}
```

#### POST /usuarios

```http
POST {{baseUrl}}/usuarios
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "cedula": "1000000002",
  "nombre": "Usuario API Prueba 2",
  "correo": "api-prueba2@biolock.test",
  "telefono": "3000000002",
  "password": "Pruebas123!"
}
```

Status esperado: `201`

#### PATCH /usuarios/:id

```http
PATCH {{baseUrl}}/usuarios/3
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Usuario API Prueba 2 Actualizado",
  "correo": "api-prueba2-updated@biolock.test",
  "telefono": "3000000099"
}
```

#### PATCH /usuarios/:id/estado

```http
PATCH {{baseUrl}}/usuarios/3/estado
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "activo": false
}
```

#### DELETE /usuarios/:id/roles/:rolId

```http
DELETE {{baseUrl}}/usuarios/3/roles/1
Authorization: Bearer {{token}}
```

Status esperado: `200`

---

### 5.4 Roles

#### GET /roles

#### GET /roles/:id

#### POST /roles

```http
POST {{baseUrl}}/roles
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Rol API Prueba",
  "descripcion": "Rol de validación automatica"
}
```

#### PATCH /roles/:id

```http
PATCH {{baseUrl}}/roles/5
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Rol API Prueba Modificado",
  "descripcion": "descripcion actualizada"
}
```

#### PUT /roles/:id/permisos

```http
PUT {{baseUrl}}/roles/5/permisos
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "permisos": [1, 2, 3]
}
```

Status esperado: `200`

---

### 5.5 Zonas

#### GET /zonas

#### GET /zonas/:id

#### POST /zonas

```http
POST {{baseUrl}}/zonas
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Zona API Prueba",
  "descripcion": "Zona de validación automatica",
  "nivel_seguridad": 2
}
```

#### PATCH /zonas/:id

```http
PATCH {{baseUrl}}/zonas/2
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Zona API Prueba Modificada",
  "descripcion": "descripcion actualizada",
  "nivel_seguridad": 3
}
```

#### PATCH /zonas/:id/estado

```http
PATCH {{baseUrl}}/zonas/2/estado
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "activa": false
}
```

---

### 5.6 Horarios de acceso

#### GET /zonas/:zonaId/horarios

```http
GET {{baseUrl}}/zonas/2/horarios
Authorization: Bearer {{token}}
```

#### POST /zonas/:zonaId/horarios

```http
POST {{baseUrl}}/zonas/2/horarios
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "dia_semana": 1,
  "hora_inicio": "08:00",
  "hora_fin": "12:00",
  "activo": true
}
```

#### PUT /zonas/:zonaId/horarios

```http
PUT {{baseUrl}}/zonas/2/horarios
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "horarios": [
    {
      "dia_semana": 1,
      "hora_inicio": "08:00",
      "hora_fin": "12:00",
      "activo": true
    }
  ]
}
```

#### PATCH /zonas/horarios/:id

```http
PATCH {{baseUrl}}/zonas/horarios/7
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "hora_inicio": "09:00",
  "hora_fin": "13:00",
  "activo": true
}
```

#### DELETE /zonas/horarios/:id

```http
DELETE {{baseUrl}}/zonas/horarios/7
Authorization: Bearer {{token}}
```

---

### 5.7 Dispositivos

#### GET /dispositivos

#### GET /dispositivos/:id

#### POST /dispositivos

```http
POST {{baseUrl}}/dispositivos
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Disp API Prueba",
  "codigo_serie": "D-API-001",
  "ubicacion": "Laboratorio",
  "ip_local": "10.0.0.15"
}
```

Status esperado: `201`

#### PATCH /dispositivos/:id

```http
PATCH {{baseUrl}}/dispositivos/2
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Disp API Prueba Modificado",
  "ubicacion": "Laboratorio 2",
  "estado": "online",
  "activo": true
}
```

#### PATCH /dispositivos/:id/estado

```http
PATCH {{baseUrl}}/dispositivos/2/estado
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "activo": false
}
```

#### POST /dispositivos/:id/token

```http
POST {{baseUrl}}/dispositivos/2/token
Authorization: Bearer {{token}}
```

#### GET /dispositivos/:id/configuracion

```http
GET {{baseUrl}}/dispositivos/2/configuracion
Authorization: Bearer {{token}}
```

#### PUT /dispositivos/:id/configuracion

```http
PUT {{baseUrl}}/dispositivos/2/configuracion
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "umbral_biometrico": 0.65,
  "modo": "strict"
}
```

---

### 5.8 Accesos

#### GET /accesos

```http
GET {{baseUrl}}/accesos
Authorization: Bearer {{token}}
```

Status esperado: `200`

---

### 5.9 Intentos fallidos

#### GET /intentos-fallidos

```http
GET {{baseUrl}}/intentos-fallidos
Authorization: Bearer {{token}}
```

Status esperado: `200`

---

### 5.10 Alarmas

#### GET /alarmas

```http
GET {{baseUrl}}/alarmas
Authorization: Bearer {{token}}
```

#### GET /alarmas/:id

```http
GET {{baseUrl}}/alarmas/1
Authorization: Bearer {{token}}
```

#### PATCH /alarmas/:id/resolver

```http
PATCH {{baseUrl}}/alarmas/1/resolver
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "estado": "resuelta",
  "observaciones": "Validación automatica desde Postman"
}
```

#### GET /alarmas/activas/conteo

```http
GET {{baseUrl}}/alarmas/activas/conteo
Authorization: Bearer {{token}}
```

---

### 5.11 Dashboard

#### GET /dashboard/resumen

```http
GET {{baseUrl}}/dashboard/resumen
Authorization: Bearer {{token}}
```

#### GET /dashboard/tendencia?dias=7

```http
GET {{baseUrl}}/dashboard/tendencia?dias=7
Authorization: Bearer {{token}}
```

---

### 5.12 Reportes

#### GET /reportes

```http
GET {{baseUrl}}/reportes
Authorization: Bearer {{token}}
```

#### GET /reportes/:clave

```http
GET {{baseUrl}}/reportes/accesos-por-zona
Authorization: Bearer {{token}}
```

También puedes probar:

- `accesos-por-usuario`

---

### 5.13 Auditoría

#### GET /auditoria

```http
GET {{baseUrl}}/auditoria
Authorization: Bearer {{token}}
```

Opcionalmente puedes filtrar:

```http
GET {{baseUrl}}/auditoria?usuario_id=2&accion=LOGIN&tabla=sesiones
Authorization: Bearer {{token}}
```

---

## 6. Resultado de validación real realizada

Se ejecutaron estas rutas contra la base PostgreSQL local y quedaron validadas con respuestas HTTP correctas:

| Ruta | Método | Estado |
|---|---:|---:|
| /salud | GET | 200 |
| /auth/login | POST | 201 |
| /auth/me | GET | 200 |
| /auth/refresh | POST | 201 |
| /usuarios | GET | 200 |
| /roles | GET | 200 |
| /zonas | GET | 200 |
| /dispositivos | GET | 200 |
| /accesos | GET | 200 |
| /intentos-fallidos | GET | 200 |
| /alarmas | GET | 200 |
| /dashboard/resumen | GET | 200 |
| /dashboard/tendencia | GET | 200 |
| /reportes | GET | 200 |
| /auditoria | GET | 200 |
| /usuarios | POST | 201 |
| /roles | POST | 201 |
| /zonas | POST | 201 |
| /dispositivos | POST | 201 |
| /dispositivos/:id/token | POST | 201 |
| /auth/logout | POST | 204 |

> La única corrección necesaria fue la creación de usuarios: el servicio usaba `require()` dentro de un proyecto ESM. Se corrigió y quedó validada.

---

## 7. Recomendaciones para Postman

1. Usa `{{baseUrl}}` para no repetir la URL.
2. Guarda `Authorization: Bearer {{token}}` en un header global de colección.
3. Crea una carpeta por módulo: `Auth`, `Usuarios`, `Roles`, `Zonas`, `Dispositivos`, `Dashboard`, `Reportes`.
4. Prueba primero `login`, luego la ruta `me` y luego las demás rutas protegidas.
5. Para rutas que modifican datos, hazlo en una base local o de prueba.

---

## 8. Ejemplo de colección rápida

### Paso 1: Login

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json
```

```json
{
  "usuario": "qa@biolock.test",
  "contrasena": "Pruebas123!"
}
```

### Paso 2: Obtener perfil

```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

### Paso 3: Listar usuarios

```http
GET {{baseUrl}}/usuarios
Authorization: Bearer {{token}}
```

---

## 9. Diagnóstico rápido si falla algo

Si una request falla con `401`:

- revisa que el token exista en la variable `token`
- asegúrate de usar `Authorization: Bearer {{token}}`
- vuelve a ejecutar login

Si una request falla con `403`:

- el usuario no tiene ese permiso
- usa `qa@biolock.test` como usuario de pruebas con permisos superadmin

Si una request falla con `400`:

- revisa el body JSON y los nombres de campos exactos
- algunos endpoints esperan `nivel_seguridad`, `dia_semana`, `hora_inicio`, etc.

Si una request falla con `500`:

- revisa el backend en la consola de Nest
- confirma que no haya un error en el servicio o query SQL

---

## 10. Credenciales de prueba

Usuario de validación recomendado:

```json
{
  "usuario": "qa@biolock.test",
  "contrasena": "Pruebas123!"
}
```

Este usuario ya fue validado con permisos para ejecutar la mayoría de los endpoints del panel.
