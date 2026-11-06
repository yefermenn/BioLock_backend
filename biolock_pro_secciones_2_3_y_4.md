# BioLock Pro - Pendientes de la API y del despliegue para el panel
**Fecha:** Nov 5, 2026

---

## 2. Rutas nuevas

R1 y R2 son las que más se notan en una demo: sin R1 no se pueden asignar roles y sin R2 todos los usuarios salen con biometría "Pendiente".

| # | Ruta | Para qué | Detalle |
|---|---|---|---|
| **R1** | `POST /usuarios/:id/roles` con `{ rol_id }` y `DELETE /usuarios/:id/roles/:rol_id` | Asignar y quitar roles desde el detalle del usuario | Hoy da 404. El panel ya tiene el botón y muestra el error |
| **R2** | `POST /dispositivos/biometria` con el token del dispositivo, body `{ usuario_ids: [1, 6] }` | La Pi avisa qué usuarios tienen rostro registrado después de `enroll_faces.py` | Marcar `biometria_registrada = TRUE` y `fecha_registro_biometrico`; desmarcar a los que ya no vengan. Solo viajan ids, nada biométrico. Hoy toca hacerlo a mano en la base |
| **R3** | `PATCH /usuarios/:id/password` (nombre libre), solo superadmin | Restablecer la contraseña de otro usuario | |
| **R4** | `GET /permisos`, o los permisos dentro de `/roles` | Ver la lista completa de permisos | Hoy da 404 |
| **R5** | `GET /horarios` (opcional) | Alinear con el planteamiento | Hoy solo existe `/zonas/:id/horarios` y el panel ya usa esa |

---

## 3. Correcciones en rutas existentes

C1 y C2 son las más visibles: hoy el detalle de cada usuario muestra los accesos de todos, y al resolver una alarma se pierde su descripción.

| # | Ruta | Problema | Corrección |
|---|---|---|---|
| **C1** | `GET /accesos?usuario_id=` | Ignora el filtro: devuelve todos los accesos | Aplicar `usuario_id`, `zona_id`, `dispositivo_id` y `tipo_acceso` |
| **C2** | `PATCH /alarmas/:id/resolver` | Guarda la nota encima de observaciones (la alarma 1 perdió "Evento de alarma camara") y no registra quién ni cuándo | Nota en un campo aparte; llenar `resuelta_por` (usuario del JWT) y `fecha_resolucion`, y devolverlos en `GET /alarmas/:id`. Si el MER v2.1 no tiene esos campos, hablarlo con Sandrith |
| **C3** | `GET /alarmas/:id` | `intentos_fallidos` llega en camelCase (`dispositivoId`, `scoreObtenido`, `timestamp`) | Pasarlo a snake_case como el resto de la API |
| **C4** | Errores de validación (400) | Formato por defecto de NestJS `{ message: [...], error, statusCode }`, en inglés | Unificar a `{ error, mensaje }` en español |
| **C5** | `POST /zonas/:id/horarios` | Acepta horarios que se cruzan: la zona PRUEBA tenía 7 lunes idénticos | Responder 409 si se cruza con uno existente |
| **C6** | `/dashboard/tendencia` y `/dashboard/resumen` | La tendencia marca 0 intentos el 4 nov y `/intentos-fallidos` tiene 5; `ultimos_eventos` llega vacío con accesos ese día | Revisar las consultas |
| **C7** | `GET /usuarios` | El rol superadmin llega con `id: 0` | Confirmar si es el id real |
| **C8** | `/reportes` | Solo "accesos por zona" y "accesos por usuario" | Agregar las vistas de Sandrith: accesos por día, intentos por dispositivo, usuarios sin biometría y ocupación |
| **C9** | Auditoría | Solo registra LOGIN; la creación de usuarios no aparece | Registrar POST, PATCH y DELETE en el interceptor |
| **C10** | `POST /eventos` | `dispositivos.ultima_conexion` no cambia, así que BioLock-1 sale "Sin conexión" | Actualizarlo en cada evento de la Pi |
| **C11** | Permisos | Faltan `ver_roles` y uno para regenerar el token del dispositivo | Crearlos; hoy el panel usa `gestionar_roles` y `gestionar_dispositivos` |

---

## 4. Confirmaciones y datos de prueba

El panel ya tolera cualquiera de las respuestas; confirmarlas solo lo hace más preciso.

- [ ] ¿`limite` se corta en 20 a propósito?
- [ ] ¿`/usuarios` acepta un parámetro de búsqueda y `/alarmas` uno de estado? Con eso todo pagina en el servidor.
- [ ] ¿Qué devuelve `POST /dispositivos/:id/token` y cómo se llama el campo del token nuevo?

Pasar las alarmas de prueba 2 y 3 al 4 nov: hoy tienen fecha 5 y 6 nov a las 4:31 p. m., en el futuro.